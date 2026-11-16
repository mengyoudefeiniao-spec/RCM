// Demonstration accounts share the existing business store. Production authentication still belongs to the auth service.
import { isPocketBaseSyncEnabled, readPocketBaseValue, writePocketBaseValue } from '../services/pocketBaseSync.js';
import { createAdminCredential as createPasswordCredential, verifyPasswordCredential } from './adminCredentials.js';

export const CITIZEN_ACCOUNTS_KEY = 'rcm_shared_citizen_accounts';
const legacyKey = 'rcm_demo_registrations';
function localAccounts(storage, key) {
  try { const value = JSON.parse(storage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function matches(account, identifier) { return account.phone === identifier || account.nationalId === identifier || (account.rationCardNo && account.rationCardNo === identifier); }
export async function getCitizenAccounts() {
  if (isPocketBaseSyncEnabled()) {
    const value = await readPocketBaseValue(CITIZEN_ACCOUNTS_KEY);
    return Array.isArray(value) ? value : [];
  }
  return localAccounts(localStorage, CITIZEN_ACCOUNTS_KEY);
}
async function persistAccounts(accounts) {
  if (isPocketBaseSyncEnabled()) await writePocketBaseValue(CITIZEN_ACCOUNTS_KEY, accounts);
  else localStorage.setItem(CITIZEN_ACCOUNTS_KEY, JSON.stringify(accounts));
}
export async function findCitizenAccount(identifier) {
  const accounts = await getCitizenAccounts();
  return accounts.find(account => matches(account, identifier))
    || localAccounts(sessionStorage, legacyKey).find(account => matches(account, identifier)) || null;
}
function sharedAccount(fields, passwordCredential) {
  return {
    id: `registered-${fields.nationalId}`, province: fields.province,
    provinceCode: fields.provinceCode || fields.province || null,
    provinceNames: fields.provinceNames || null,
    agencyCode: fields.agencyCode || null,
    agencyNames: fields.agencyNames || null,
    phone: fields.phone, nationalId: fields.nationalId, name: fields.name || '',
    passwordCredential, passwordUpdatedAt: fields.passwordUpdatedAt || null,
    registeredAt: fields.registeredAt || new Date().toISOString(),
    identityVerification: fields.identityVerification || null, simulatedFamilyNumber: fields.simulatedFamilyNumber || null,
    familyId: fields.familyId || null, familyNumber: fields.familyNumber || null,
    rationCardNo: fields.rationCardNo || null, paperCardNo: fields.paperCardNo || null,
    cardType: fields.cardType || null, ocrCardNo: fields.ocrCardNo || null,
    centerId: fields.centerId || null, centerName: fields.centerName || null,
    foodAgentId: fields.foodAgentId || null, foodAgentName: fields.foodAgentName || null,
    flourAgentId: fields.flourAgentId || null, flourAgentName: fields.flourAgentName || null
  };
}
export async function createCitizenAccount(fields) {
  const accounts = await getCitizenAccounts();
  const identifiers = [fields.phone, fields.nationalId];
  if ([...accounts, ...localAccounts(sessionStorage, legacyKey)].some(account => identifiers.some(identifier => matches(account, identifier)))) {
    const error = new Error('Duplicate citizen account'); error.code = 'DUPLICATE_ACCOUNT'; throw error;
  }
  const account = sharedAccount(fields, await createPasswordCredential(fields.password));
  await persistAccounts([...accounts, account]);
  return account;
}
// Repeated national IDs / phone numbers / ration cards no longer block
// registration: the previous account rows are removed so the new registration
// starts from a clean state (the shared store rewrites the PocketBase record).
export async function removeCitizenAccounts(predicate) {
  if (typeof predicate !== 'function') return 0;
  const accounts = await getCitizenAccounts();
  const remaining = accounts.filter(account => !predicate(account));
  const removed = accounts.length - remaining.length;
  if (removed) await persistAccounts(remaining);
  const legacyList = localAccounts(sessionStorage, legacyKey);
  const keptLegacy = legacyList.filter(account => !predicate(account));
  if (keptLegacy.length !== legacyList.length) {
    if (keptLegacy.length) sessionStorage.setItem(legacyKey, JSON.stringify(keptLegacy));
    else sessionStorage.removeItem(legacyKey);
  }
  return removed;
}

export async function updateCitizenAccount(nationalId, updates) {
  const accounts = await getCitizenAccounts();
  const index = accounts.findIndex(account => account.nationalId === nationalId);
  if (index < 0) throw new Error('Citizen account missing');
  const next = { ...accounts[index], ...updates };
  accounts[index] = sharedAccount(next, next.passwordCredential);
  await persistAccounts(accounts);
  return accounts[index];
}
// Password recovery replaces the stored credential and records when it changed.
export async function resetCitizenPassword(identifier, password) {
  const accounts = await getCitizenAccounts();
  const index = accounts.findIndex(account => matches(account, identifier));
  if (index < 0) return null;
  const passwordCredential = await createPasswordCredential(password);
  const passwordUpdatedAt = new Date().toISOString();
  accounts[index] = sharedAccount({ ...accounts[index], passwordCredential, passwordUpdatedAt }, passwordCredential);
  await persistAccounts(accounts);
  // Remove any tab-only legacy copy so the previous password stops working.
  const remaining = localAccounts(sessionStorage, legacyKey).filter(entry => entry.nationalId !== accounts[index].nationalId);
  if (remaining.length) sessionStorage.setItem(legacyKey, JSON.stringify(remaining)); else sessionStorage.removeItem(legacyKey);
  return accounts[index];
}

export async function verifyCitizenAccountPassword(account, password) {
  if (account.passwordCredential) return await verifyPasswordCredential(password, account.passwordCredential) ? account : null;
  // Upgrade the previous tab-only accounts after their original password has been checked.
  const legacyAccount = localAccounts(sessionStorage, legacyKey).find(entry => entry.nationalId === account.nationalId && entry.phone === account.phone);
  if (!legacyAccount) return null;
  const digest = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), byte => byte.toString(16).padStart(2, '0')).join('');
  if (await digest(password) !== (legacyAccount.passwordDigest || await digest('iq-pass-2026'))) return null;
  const accounts = await getCitizenAccounts();
  const upgraded = sharedAccount(account, await createPasswordCredential(password));
  const index = accounts.findIndex(entry => entry.nationalId === account.nationalId);
  if (index < 0) accounts.push(upgraded); else accounts[index] = upgraded;
  await persistAccounts(accounts);
  const remaining = localAccounts(sessionStorage, legacyKey).filter(entry => entry.nationalId !== account.nationalId);
  if (remaining.length) sessionStorage.setItem(legacyKey, JSON.stringify(remaining)); else sessionStorage.removeItem(legacyKey);
  return upgraded;
}
