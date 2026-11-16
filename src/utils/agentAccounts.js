// Registered agent accounts live in their own shared store (`rcm_shared_agent_accounts`),
// separate from citizen accounts. Production authentication still belongs to the auth service.
import { isPocketBaseSyncEnabled, readPocketBaseValue, writePocketBaseValue } from '../services/pocketBaseSync.js';
import { createAdminCredential as createPasswordCredential, verifyPasswordCredential } from './adminCredentials.js';

export const AGENT_ACCOUNTS_KEY = 'rcm_shared_agent_accounts';

function localAccounts() {
  try {
    const value = JSON.parse(localStorage.getItem(AGENT_ACCOUNTS_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function matchesAgent(account, identifier) {
  const value = String(identifier || '').trim();
  if (!value) return false;
  return account.agentNo === value
    || account.phone === value
    || account.nationalId === value;
}

export async function getAgentAccounts() {
  if (isPocketBaseSyncEnabled()) {
    const value = await readPocketBaseValue(AGENT_ACCOUNTS_KEY);
    return Array.isArray(value) ? value : [];
  }
  return localAccounts();
}

async function persistAccounts(accounts) {
  if (isPocketBaseSyncEnabled()) await writePocketBaseValue(AGENT_ACCOUNTS_KEY, accounts);
  else localStorage.setItem(AGENT_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function sharedAccount(fields, passwordCredential) {
  return {
    id: `registered-agent-${fields.agentNo}`,
    agentNo: fields.agentNo,
    companyBranchCode: fields.companyBranchCode,
    companyBranchNames: fields.companyBranchNames || {},
    shopNames: fields.shopNames || {},
    ownerNames: fields.ownerNames || {},
    centerId: fields.centerId || null,
    phone: fields.phone,
    nationalId: fields.nationalId,
    passwordCredential,
    passwordUpdatedAt: fields.passwordUpdatedAt || null,
    registeredAt: fields.registeredAt || new Date().toISOString(),
    identityVerification: fields.identityVerification || null
  };
}

export async function findAgentAccount(identifier) {
  const accounts = await getAgentAccounts();
  return accounts.find(account => matchesAgent(account, identifier)) || null;
}

export async function createAgentAccount(fields) {
  const accounts = await getAgentAccounts();
  const taken = accounts.some(account => matchesAgent(account, fields.agentNo)
    || matchesAgent(account, fields.phone)
    || matchesAgent(account, fields.nationalId));
  if (taken) {
    const error = new Error('Duplicate agent account');
    error.code = 'DUPLICATE_ACCOUNT';
    throw error;
  }
  const account = sharedAccount(fields, await createPasswordCredential(fields.password));
  await persistAccounts([...accounts, account]);
  return account;
}

export async function updateAgentAccount(agentNo, updates) {
  const accounts = await getAgentAccounts();
  const index = accounts.findIndex(account => account.agentNo === agentNo);
  if (index < 0) throw new Error('Agent account missing');
  const next = { ...accounts[index], ...updates };
  accounts[index] = sharedAccount(next, next.passwordCredential);
  await persistAccounts(accounts);
  return accounts[index];
}

export async function verifyAgentAccountPassword(account, password) {
  if (!account?.passwordCredential) return null;
  return await verifyPasswordCredential(password, account.passwordCredential) ? account : null;
}
