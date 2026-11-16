// Citizen registration province / agency catalog.
// The registry keeps stable codes plus multilingual names so the same agency
// renders correctly in Chinese, English, Arabic and Kurdish, and the record is
// shared through the existing PocketBase app_data collection.
import { TRANSFER_BRANCH_OPTIONS as zhLocations } from '../mock/data/transferData.js';
import localeMessages from '../locales/citizenTransfer.js';

export const REGISTRATION_CATALOG_KEY = 'rcm_shared_registration_catalog';
export const REGISTRATION_LANGUAGES = Object.freeze(['zh', 'en', 'ar', 'ckb']);
export const REGISTRATION_PROVINCE_CODES = Object.freeze(['baghdad', 'diyala', 'nineveh', 'kirkuk', 'basra']);

const LABELS = {
  zh: localeMessages.zh?.transferLocations || {},
  en: localeMessages.en?.transferLocations || {},
  ar: localeMessages.ar?.transferLocations || {},
  ckb: localeMessages.ckb?.transferLocations || {}
};

export function normalizeRegistrationLang(lang) {
  if (lang === 'ku') return 'ckb';
  return REGISTRATION_LANGUAGES.includes(lang) ? lang : 'zh';
}

// Names are stored as { zh, en, ar, ckb }; display always resolves for the
// current UI language so switching languages re-renders the same record.
export function localizeCatalogNames(names, lang = 'zh') {
  if (!names || typeof names !== 'object') return '';
  const code = normalizeRegistrationLang(lang);
  return names[code] || names.en || names.zh || names.ar || names.ckb || '';
}

function namesFor(labelKey, fallback) {
  return REGISTRATION_LANGUAGES.reduce((names, lang) => {
    names[lang] = LABELS[lang][labelKey] || fallback || '';
    return names;
  }, {});
}

export function buildRegistrationCatalog() {
  const provinces = zhLocations.map((province, provinceIndex) => {
    const code = REGISTRATION_PROVINCE_CODES[provinceIndex] || `province${provinceIndex}`;
    return {
      code,
      names: namesFor(`province${provinceIndex}`, province.province),
      agencies: province.branches.map((branch, branchIndex) => ({
        code: branch.code || `${code}-branch${branchIndex + 1}`,
        names: namesFor(`branch${provinceIndex}_${branchIndex}`, branch.branchName),
        centerIds: branch.centers.map(center => String(center.centerId))
      }))
    };
  });
  return { version: 1, updatedAt: new Date().toISOString(), provinces };
}

export function isValidRegistrationCatalog(value) {
  return Boolean(value && Array.isArray(value.provinces) && value.provinces.length) &&
    value.provinces.every(province => province?.code && province?.names &&
      Array.isArray(province.agencies) && province.agencies.length > 0 &&
      province.agencies.every(agency => agency?.code && agency?.names &&
        Array.isArray(agency.centerIds) && agency.centerIds.length > 0));
}

export function findRegistrationProvince(catalog, provinceCode) {
  return catalog?.provinces?.find(province => province.code === provinceCode) || null;
}

export function findRegistrationAgency(catalog, provinceCode, agencyCode) {
  return findRegistrationProvince(catalog, provinceCode)?.agencies.find(agency => agency.code === agencyCode) || null;
}

// Loaded lazily so pure catalog helpers stay usable outside the browser bundle.
async function pocketBaseSync() {
  return import('../services/pocketBaseSync.js');
}

async function readShared(key) {
  try {
    const sync = await pocketBaseSync();
    if (sync.isPocketBaseSyncEnabled()) {
      const remote = await sync.readPocketBaseValue(key);
      if (remote != null) return remote;
    }
  } catch {
    // Offline or misconfigured PocketBase: use the local cache.
  }
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

async function writeShared(key, value) {
  try {
    const sync = await pocketBaseSync();
    if (sync.isPocketBaseSyncEnabled()) {
      await sync.writePocketBaseValue(key, value);
      return;
    }
  } catch {
    // Keep a local copy so registration is never blocked by a sync failure.
  }
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Seeds the provincial / agency catalog once and returns the shared record.
 * The record lives in PocketBase, so every device and language reads the same
 * source of truth, and the multilingual names travel with the data.
 */
export async function loadRegistrationCatalog() {
  const existing = await readShared(REGISTRATION_CATALOG_KEY);
  if (isValidRegistrationCatalog(existing)) return existing;
  const catalog = buildRegistrationCatalog();
  await writeShared(REGISTRATION_CATALOG_KEY, catalog);
  return catalog;
}
