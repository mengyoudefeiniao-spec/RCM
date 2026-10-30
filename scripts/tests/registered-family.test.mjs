import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getRegisteredFamily } from '../../src/utils/registeredFamily.js';
import { getInitialFamilies, getSharedFamilies, updateSharedFamily } from '../../src/utils/sharedSession.js';

const languages = ['zh', 'en', 'ar', 'ku'];
const account = { nationalId: 'TEST-123', name: 'Test Person', phone: '07000000001', province: 'baghdad' };
beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
  globalThis.sessionStorage = { getItem: () => null };
});

test('creates one separate pending card and member for each account across languages', () => {
  const first = getRegisteredFamily(account, 'zh');
  assert.match(first.rationCardNo, /^RC-TMP-/);
  assert.equal(first.cardUnconfirmed, true);
  assert.equal(first.members[0].name, account.name);
  assert.equal(first.members[0].nationalId, account.nationalId);
  assert.equal(first.members[0].verification.status, 'pending');
  const second = getRegisteredFamily({ ...account, nationalId: 'TEST-456', name: 'Second' }, 'en');
  assert.notEqual(first.rationCardNo, second.rationCardNo);
  for (const lang of languages) {
    assert.equal(getRegisteredFamily(account, lang).rationCardNo, first.rationCardNo);
    assert.equal(getRegisteredFamily({ ...account, nationalId: 'TEST-456' }, lang).rationCardNo, second.rationCardNo);
  }
  updateSharedFamily(first.rationCardNo, family => ({ ...family, members: family.members.map(member => ({ ...member, phone: 'updated' })) }), 'zh');
  for (const lang of languages) assert.equal(getRegisteredFamily(account, lang).members[0].phone, 'updated');
});

test('uses identity rather than card number to find an existing household', () => {
  const seeded = getInitialFamilies('en')[0];
  const owner = { ...account, nationalId: seeded.members[1].nationalId };
  assert.equal(getRegisteredFamily(owner, 'en').rationCardNo, seeded.rationCardNo);
  const unrelated = getRegisteredFamily({ ...account, rationCardNo: seeded.rationCardNo }, 'en');
  assert.notEqual(unrelated.rationCardNo, seeded.rationCardNo);
  assert.equal(unrelated.members[0].nationalId, account.nationalId);
});

test('previous accounts without a name still have their own member record', () => {
  const family = getRegisteredFamily({ ...account, name: '' }, 'ar');
  assert.equal(family.members[0].name, account.nationalId);
  assert.ok(getSharedFamilies('ar').some(item => item.rationCardNo === family.rationCardNo));
});

test('keeps the simulated OCR number separate from the real family number', () => {
  const family = getRegisteredFamily({ ...account, familyNumber: 'REAL-EXISTING', simulatedFamilyNumber: 'SIM-A1B2C3D4' }, 'zh');
  assert.equal(family.simulatedFamilyNumber, 'SIM-A1B2C3D4');
  assert.equal(family.members[0].simulatedFamilyNumber, 'SIM-A1B2C3D4');
  assert.equal(family.familyCode, '');
  for (const lang of languages) assert.equal(getRegisteredFamily(account, lang).simulatedFamilyNumber, 'SIM-A1B2C3D4');
});
