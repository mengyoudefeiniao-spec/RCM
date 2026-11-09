/**
 * Local evidence store for the field verification module.
 * Records and photos stay on the device until the tester exports a report.
 */

const DB_NAME = 'rcm_field_verification';
const DB_VERSION = 1;
const RECORDS = 'records';
const IMAGES = 'images';

let dbPromise;
const imageUrlCache = new Map();

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexeddb-unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDS)) {
        const records = db.createObjectStore(RECORDS, { keyPath: 'id' });
        records.createIndex('caseId', 'caseId');
        records.createIndex('createdAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains(IMAGES)) {
        const images = db.createObjectStore(IMAGES, { keyPath: 'id' });
        images.createIndex('caseId', 'caseId');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function withStore(storeNames, mode, run) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames, mode);
    let output;
    transaction.oncomplete = () => resolve(output);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
    output = run(transaction);
  });
}

export async function saveRecord(record) {
  const value = {
    id: record.id || crypto.randomUUID(),
    caseId: record.caseId,
    createdAt: record.createdAt || new Date().toISOString(),
    kind: record.kind || 'manual',
    verdict: record.verdict || null,
    note: record.note || '',
    input: record.input || {},
    metrics: record.metrics || {},
    imageIds: record.imageIds || [],
    device: record.device || null,
  };
  await withStore(RECORDS, 'readwrite', transaction => transaction.objectStore(RECORDS).put(value));
  return value;
}

export async function listRecords(caseId) {
  const db = await openDb();
  const store = db.transaction(RECORDS, 'readonly').objectStore(RECORDS);
  const records = await requestToPromise(
    caseId ? store.index('caseId').getAll(caseId) : store.getAll()
  );
  return (records || []).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}

export async function deleteRecord(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDS, IMAGES], 'readwrite');
    const recordStore = transaction.objectStore(RECORDS);
    const imageStore = transaction.objectStore(IMAGES);
    const read = recordStore.get(id);
    let removed = null;
    read.onsuccess = () => {
      removed = read.result;
      for (const imageId of removed?.imageIds || []) {
        imageStore.delete(imageId);
        const url = imageUrlCache.get(imageId);
        if (url) {
          URL.revokeObjectURL(url);
          imageUrlCache.delete(imageId);
        }
      }
      recordStore.delete(id);
    };
    transaction.oncomplete = () => resolve(removed);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function saveImage(blob, { caseId, label = '', width, height } = {}) {
  const id = crypto.randomUUID();
  const value = { id, caseId, label, blob, width, height, createdAt: new Date().toISOString() };
  await withStore(IMAGES, 'readwrite', transaction => transaction.objectStore(IMAGES).put(value));
  return { id, width, height, size: blob.size };
}

export async function getImage(imageId) {
  const db = await openDb();
  const store = db.transaction(IMAGES, 'readonly').objectStore(IMAGES);
  return requestToPromise(store.get(imageId));
}

export async function imageUrl(imageId) {
  if (imageUrlCache.has(imageId)) return imageUrlCache.get(imageId);
  const image = await getImage(imageId);
  if (!image?.blob) return '';
  const url = URL.createObjectURL(image.blob);
  imageUrlCache.set(imageId, url);
  return url;
}

export async function listImages(caseId) {
  const db = await openDb();
  const store = db.transaction(IMAGES, 'readonly').objectStore(IMAGES);
  const images = await requestToPromise(caseId ? store.index('caseId').getAll(caseId) : store.getAll());
  return images || [];
}

export async function storageSummary() {
  try {
    const images = await listImages();
    const bytes = images.reduce((total, image) => total + (image.blob?.size || 0), 0);
    return { images: images.length, bytes };
  } catch {
    return { images: 0, bytes: 0 };
  }
}

export async function clearAll() {
  for (const url of imageUrlCache.values()) URL.revokeObjectURL(url);
  imageUrlCache.clear();
  await withStore([RECORDS, IMAGES], 'readwrite', transaction => {
    transaction.objectStore(RECORDS).clear();
    transaction.objectStore(IMAGES).clear();
  });
}
