const enabled = import.meta.env.VITE_POCKETBASE_SYNC === 'true';
const baseUrl = String(import.meta.env.VITE_POCKETBASE_URL || '').replace(/\/+$/, '');
const collection = import.meta.env.VITE_POCKETBASE_COLLECTION || 'app_data';
const filesCollection = import.meta.env.VITE_POCKETBASE_FILES_COLLECTION || 'app_files';
const PAGE_SIZE = 500;
const POLL_INTERVAL = 15000;
const EMPTY_ARRAY_MARKER = '__rcm_pocketbase_empty_array_v1__';

const localKeys = new Set();
const pendingKeys = new Set();
let writeQueue = Promise.resolve();
let originalGetItem;
let originalSetItem;
let originalRemoveItem;

function isSharedBusinessKey(key) {
  if (!key) return false;
  return key.startsWith('rcm_shared_') || key.startsWith('rcm_center_') ||
    key.startsWith('rcm_registration_') ||
    (key.startsWith('rcm_my_') && !/(password|face_proof|password_sms)/i.test(key));
}

export function isPocketBaseSyncEnabled() {
  return enabled && !!baseUrl;
}

function recordUrl(id = '') {
  return `${baseUrl}/api/collections/${encodeURIComponent(collection)}/records${id ? `/${encodeURIComponent(id)}` : ''}`;
}

function encodePocketBaseValue(value) {
  // PocketBase treats [] as blank when the JSON field is required.
  return Array.isArray(value) && value.length === 0 ? { [EMPTY_ARRAY_MARKER]: true } : value;
}

function decodePocketBaseValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) &&
      Object.keys(value).length === 1 && value[EMPTY_ARRAY_MARKER] === true) {
    return [];
  }
  return value;
}

async function request(url, options = {}) {
  const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const hasJsonBody = options.body != null && !isMultipart;
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(12000),
    headers: { ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`PocketBase ${response.status}: ${detail || response.statusText}`);
  }
  return response.status === 204 ? null : response.json();
}

async function listRecords() {
  const records = [];
  let page = 1;
  while (true) {
    const result = await request(`${recordUrl()}?page=${page}&perPage=${PAGE_SIZE}`);
    records.push(...(result.items || []));
    if (page >= (result.totalPages || 1)) return records;
    page += 1;
  }
}

function localGet(key) {
  return originalGetItem.call(window.localStorage, key);
}

function setLocal(key, value) {
  originalSetItem.call(window.localStorage, key, value);
  localKeys.add(key);
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: value, storageArea: window.localStorage }));
}

async function persistRecord(key, value) {
  const filter = encodeURIComponent(`key = ${JSON.stringify(key)}`);
  const result = await request(`${recordUrl()}?filter=${filter}&perPage=1`);
  const payload = { key, value: encodePocketBaseValue(JSON.parse(value)) };
  if (result.items?.length) {
    await request(recordUrl(result.items[0].id), { method: 'PATCH', body: JSON.stringify(payload) });
  } else {
    try {
      await request(recordUrl(), { method: 'POST', body: JSON.stringify(payload) });
    } catch (error) {
      // A second app may have created the same key between the lookup and create.
      const retry = await request(`${recordUrl()}?filter=${filter}&perPage=1`);
      if (!retry.items?.length) throw error;
      await request(recordUrl(retry.items[0].id), { method: 'PATCH', body: JSON.stringify(payload) });
    }
  }
}

export async function readPocketBaseValue(key) {
  if (!isPocketBaseSyncEnabled()) return null;
  const filter = encodeURIComponent(`key = ${JSON.stringify(key)}`);
  const result = await request(`${recordUrl()}?filter=${filter}&perPage=1`);
  return result.items?.[0] ? decodePocketBaseValue(result.items[0].value) : null;
}

export async function writePocketBaseValue(key, value) {
  if (!isPocketBaseSyncEnabled()) return;
  await persistRecord(key, JSON.stringify(value));
}

function fileCollectionUrl(id = '') {
  return `${baseUrl}/api/collections/${encodeURIComponent(filesCollection)}/records${id ? `/${encodeURIComponent(id)}` : ''}`;
}

export async function savePocketBaseFile(key, file) {
  if (!isPocketBaseSyncEnabled()) return null;
  const filter = encodeURIComponent(`key = ${JSON.stringify(key)}`);
  const result = await request(`${fileCollectionUrl()}?filter=${filter}&perPage=1`);
  const form = new FormData();
  form.append('key', key);
  form.append('file', file, file.name || 'upload.bin');
  let saved;
  if (result.items?.length) {
    saved = await request(fileCollectionUrl(result.items[0].id), { method: 'PATCH', body: form });
  } else {
    saved = await request(fileCollectionUrl(), { method: 'POST', body: form });
  }
  return saved;
}

export async function readPocketBaseFile(key) {
  if (!isPocketBaseSyncEnabled()) return null;
  const filter = encodeURIComponent(`key = ${JSON.stringify(key)}`);
  const result = await request(`${fileCollectionUrl()}?filter=${filter}&perPage=1`);
  const record = result.items?.[0];
  if (!record?.file) return null;
  const response = await fetch(`${baseUrl}/api/files/${encodeURIComponent(filesCollection)}/${encodeURIComponent(record.id)}/${encodeURIComponent(record.file)}`);
  if (!response.ok) throw new Error(`PocketBase file download failed (${response.status}).`);
  return { record, blob: await response.blob() };
}

function queueWrite(key, value, remove = false) {
  pendingKeys.add(key);
  writeQueue = writeQueue.then(async () => {
    if (remove) {
      const filter = encodeURIComponent(`key = ${JSON.stringify(key)}`);
      const result = await request(`${recordUrl()}?filter=${filter}&perPage=1`);
      if (result.items?.length) await request(recordUrl(result.items[0].id), { method: 'DELETE' });
      localKeys.delete(key);
    } else {
      await persistRecord(key, value);
      localKeys.add(key);
    }
  }).catch((error) => {
    console.error('[PocketBase] Business data sync failed. Local cache remains available.', error);
  }).finally(() => pendingKeys.delete(key));
}

function installStorageBridge() {
  const proto = Storage.prototype;
  originalGetItem = proto.getItem;
  originalSetItem = proto.setItem;
  originalRemoveItem = proto.removeItem;

  proto.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (this === window.localStorage && isSharedBusinessKey(String(key))) {
      queueWrite(String(key), String(value));
    }
  };
  proto.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    if (this === window.localStorage && isSharedBusinessKey(String(key))) {
      queueWrite(String(key), null, true);
    }
  };
}

async function pullRemoteRecords({ mergeLocal = false } = {}) {
  const records = await listRecords();
  const remoteKeys = new Set();
  for (const record of records) {
    if (!isSharedBusinessKey(record.key)) continue;
    remoteKeys.add(record.key);
    if (pendingKeys.has(record.key)) continue;
    const serialized = JSON.stringify(decodePocketBaseValue(record.value));
    if (localGet(record.key) !== serialized) setLocal(record.key, serialized);
    localKeys.add(record.key);
  }
  for (const key of localKeys) {
    if (mergeLocal && isSharedBusinessKey(key) && !remoteKeys.has(key)) {
      const value = localGet(key);
      if (value !== null) {
        await persistRecord(key, value);
        remoteKeys.add(key);
        continue;
      }
    }
    if (isSharedBusinessKey(key) && !remoteKeys.has(key) && !pendingKeys.has(key)) {
      originalRemoveItem.call(window.localStorage, key);
      localKeys.delete(key);
    }
  }
}

export async function initializePocketBaseSync() {
  if (!enabled) return;
  if (!baseUrl) throw new Error('VITE_POCKETBASE_URL is required when PocketBase sync is enabled.');

  installStorageBridge();
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (isSharedBusinessKey(key)) localKeys.add(key);
  }

  try {
    // PocketBase wins for keys it already has; legacy local-only keys are migrated.
    await pullRemoteRecords({ mergeLocal: true });
    console.info(`[PocketBase] Synced ${localKeys.size} shared business cache entries.`);
  } catch (error) {
    console.error('[PocketBase] Initial sync failed. Check the URL, collection, and API rules.', error);
    throw error;
  }

  window.setInterval(() => {
    pullRemoteRecords().catch((error) => console.warn('[PocketBase] Refresh failed.', error));
  }, POLL_INTERVAL);
}
