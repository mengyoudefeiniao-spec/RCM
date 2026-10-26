import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { localizeDemoFamilyNames } from '../src/utils/sharedSession.js';

const baseUrl = String(process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL || 'https://pb.51xyu.com').replace(/\/+$/, '');
const collection = process.env.POCKETBASE_COLLECTION || process.env.VITE_POCKETBASE_COLLECTION || 'app_data';
const token = process.env.POCKETBASE_TOKEN;
const apply = process.argv.includes('--apply');
if (!baseUrl.startsWith('https://')) throw new Error('PocketBase must use HTTPS.');
const endpoint = `${baseUrl}/api/collections/${encodeURIComponent(collection)}/records`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15000),
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: token } : {}) }
  });
  if (!response.ok) throw new Error(`Family name repair: HTTP ${response.status}`);
  return response.json();
}

function repair(record) {
  const lang = record.key.match(/^rcm_shared_families_(zh|en|ar|ku|ckb)$/)?.[1];
  if (!lang || !Array.isArray(record.value)) return record.value;
  return record.value.map(family => localizeDemoFamilyNames(family, lang));
}

const query = new URLSearchParams({ filter: 'key ~ "rcm_shared_families_"', perPage: '100' });
const records = (await request(`${endpoint}?${query}`)).items || [];
const plan = records.filter(record => JSON.stringify(record.value) !== JSON.stringify(repair(record)));
for (const record of plan) console.log(`${apply ? 'REPAIR' : 'PLAN'} ${record.key}: restore known demonstration names only`);
if (!apply) {
  console.log(`Dry run: ${plan.length} records need repair. Use --apply to write them.`);
} else {
  const backupDirectory = new URL('../.playwright-cli/', import.meta.url);
  await mkdir(backupDirectory, { recursive: true });
  const backup = new URL(`family-names-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, backupDirectory);
  const originals = [];
  let repaired = 0;
  for (const planned of plan) {
    // Re-read immediately before patching so unrelated family edits in the plan are not reused.
    const current = await request(`${endpoint}/${encodeURIComponent(planned.id)}`);
    const value = repair(current);
    if (JSON.stringify(current.value) === JSON.stringify(value)) continue;
    originals.push(current);
    await writeFile(backup, JSON.stringify({ baseUrl, collection, records: originals }, null, 2));
    const saved = await request(`${endpoint}/${encodeURIComponent(current.id)}`, { method: 'PATCH', body: JSON.stringify({ value }) });
    if (JSON.stringify(saved.value) !== JSON.stringify(value)) throw new Error('Verification failed: ' + current.key);
    repaired++;
  }
  console.log(`Repaired and verified ${repaired} records. Backup: ${fileURLToPath(backup)}`);
}
