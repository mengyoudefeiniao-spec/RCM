import { getInitialFamilies } from '../src/utils/sharedSession.js';
import { BUSINESS_RULES_STORAGE_KEY, normalizeBusinessRulesDocument } from '../src/utils/businessRules.js';

const baseUrl = String(process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL || 'https://pb.51xyu.com')
  .replace(/\/_\/$/, '')
  .replace(/\/+$/, '');
const collection = process.env.POCKETBASE_COLLECTION || process.env.VITE_POCKETBASE_COLLECTION || 'app_data';
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;
const applyChanges = process.argv.includes('--apply');
const languages = ['zh', 'en', 'ar', 'ku'];
const EMPTY_ARRAY_MARKER = '__rcm_pocketbase_empty_array_v1__';

if (!email || !password) {
  throw new Error('Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD before running this script.');
}
if (!baseUrl.startsWith('https://')) {
  throw new Error('POCKETBASE_URL must use HTTPS.');
}

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: token } : {}),
      ...(options.headers || {})
    }
  });
  const body = await response.text();
  let result = null;
  try { result = body ? JSON.parse(body) : null; } catch { result = body; }
  if (!response.ok) {
    const details = result?.data && Object.keys(result.data).length
      ? `; details=${JSON.stringify(result.data)}`
      : '';
    const message = result?.message || (typeof result === 'string' ? result : response.statusText);
    throw new Error(`PocketBase ${response.status}: ${message}${details}`);
  }
  return result;
}

const auth = await request('/api/collections/_superusers/auth-with-password', {
  method: 'POST',
  body: JSON.stringify({ identity: email, password })
});
const token = auth.token;
const records = [];
for (let page = 1; ; page += 1) {
  const result = await request(`/api/collections/${encodeURIComponent(collection)}/records?page=${page}&perPage=500`, { token });
  records.push(...result.items);
  if (page >= result.totalPages) break;
}

const desired = new Map();
for (const lang of languages) {
  const families = getInitialFamilies(lang).map((family) => {
    const members = Array.isArray(family.members) ? family.members.slice(0, 4) : [];
    return { ...family, members, memberCount: members.length };
  });
  desired.set(`rcm_shared_families_${lang}`, families);
  desired.set(`rcm_shared_orders_${lang}`, []);
}

const byKey = new Map(records.map((record) => [record.key, record]));
// Keep the active rules intact while adding any missing Article 140 translations.
// If the PocketBase record is absent, the normalizer creates the localized defaults.
const currentBusinessRules = byKey.get(BUSINESS_RULES_STORAGE_KEY)?.value;
desired.set(BUSINESS_RULES_STORAGE_KEY, normalizeBusinessRulesDocument(currentBusinessRules));

const plan = Array.from(desired, ([key, value]) => ({ key, value, existing: byKey.get(key) }));
console.log(`PocketBase: ${baseUrl}`);
console.log(`Collection: ${collection}`);
for (const { key, value, existing } of plan) {
  const detail = key.includes('_families_')
    ? `${value.length} families; max ${Math.max(0, ...value.map((family) => family.members.length))} members each`
    : key.includes('_orders_')
      ? '0 orders'
      : `${value.rules.article140Centers.length} Article 140 centers with multilingual names and governorates`;
  console.log(`${existing ? 'UPDATE' : 'CREATE'} ${key} (${detail})`);
}

if (!applyChanges) {
  console.log('Dry run only. Re-run with --apply to write these initialization records.');
  process.exit(0);
}

for (const { key, value, existing } of plan) {
  // PocketBase rejects [] as blank when app_data.value is a required JSON field.
  const storedValue = Array.isArray(value) && value.length === 0
    ? { [EMPTY_ARRAY_MARKER]: true }
    : value;
  const body = JSON.stringify({ key, value: storedValue });
  const action = existing ? 'UPDATE' : 'CREATE';
  console.log(`${action} ${key}${existing ? ` (${existing.id})` : ''}...`);
  try {
    if (existing) {
      await request(`/api/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(existing.id)}`, {
        method: 'PATCH', token, body
      });
    } else {
      await request(`/api/collections/${encodeURIComponent(collection)}/records`, {
        method: 'POST', token, body
      });
    }
  } catch (error) {
    throw new Error(`${action} ${key} failed: ${error.message}`, { cause: error });
  }
}

console.log('PocketBase demo data reset completed. Family records now contain at most four members, monthly citizen ration orders are empty, and Article 140 centers include multilingual names and governorates.');
