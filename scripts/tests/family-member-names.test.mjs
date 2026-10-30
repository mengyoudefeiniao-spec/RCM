import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getInitialFamilies, getSharedFamilies, getSharedFamily, updateSharedFamily, localizeDemoFamilyNames } from '../../src/utils/sharedSession.js';

const languages = ['zh', 'en', 'ar', 'ku'];
const cardNo = 'RC-10029381';
const clone = value => JSON.parse(JSON.stringify(value));
let writes;
beforeEach(() => {
  const values = new Map();
  writes = [];
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { writes.push(key); values.set(key, String(value)); },
    removeItem: key => values.delete(key)
  };
  globalThis.sessionStorage = { getItem: () => 'name-regression' };
  for (const lang of languages) localStorage.setItem('rcm_shared_families_' + lang, JSON.stringify(getInitialFamilies(lang)));
  writes.length = 0;
});

test('demo members start pending and legacy flags are repaired without changing recorded results', () => {
  for (const lang of languages) {
    const family = getInitialFamilies(lang)[0];
    assert.equal(family.members[0].faceVerified, true);
    assert.deepEqual(family.members.slice(1).map(member => member.faceVerified), [false, false, false]);
    family.members[1].faceVerified = true;
    family.members[3].faceVerified = true;
    family.members[3].verification = { status: 'passed' };
    localStorage.setItem('rcm_shared_families_' + lang, JSON.stringify([family]));
    const result = getSharedFamilies(lang)[0];
    assert.equal(result.members[1].faceVerified, false);
    assert.equal(result.members[3].faceVerified, true);
    assert.equal(result.members[3].verification.status, 'passed');
    assert.equal(getSharedFamilies(lang)[0].members[1].faceVerified, false);
  }
});

test('repairs known demo names overwritten by another locale while preserving business fields', () => {
  const source = getInitialFamilies('zh')[0];
  for (const lang of languages) {
    const corrupted = getInitialFamilies(lang)[0];
    corrupted.members = clone(source.members);
    corrupted.members[0].phone = 'updated-contact';
    corrupted.members[3].freezeDate = '2026-10-26';
    const repaired = localizeDemoFamilyNames(corrupted, lang);
    assert.deepEqual(repaired.members.map(m => m.name), getInitialFamilies(lang)[0].members.map(m => m.name));
    assert.deepEqual(repaired.members.map(({ name, ...member }) => member), corrupted.members.map(({ name, ...member }) => member));
    assert.equal(localizeDemoFamilyNames(repaired, lang), repaired, 'Repair is idempotent');
    assert.equal(repaired.members[0].phone, 'updated-contact');
    assert.equal(repaired.members[3].freezeDate, '2026-10-26');
  }
});

test('heals persisted PocketBase-style caches once, including the ckb to ku language alias', () => {
  const family = getInitialFamilies('ar')[0];
  family.members = getInitialFamilies('zh')[0].members;
  localStorage.setItem('rcm_shared_families_ar', JSON.stringify([family]));
  writes.length = 0;
  assert.deepEqual(getSharedFamilies('ar')[0].members.map(m => m.name), getInitialFamilies('ar')[0].members.map(m => m.name));
  assert.equal(writes.filter(key => key === 'rcm_shared_families_ar').length, 1);
  getSharedFamilies('ar');
  assert.equal(writes.filter(key => key === 'rcm_shared_families_ar').length, 1);
  assert.deepEqual(getSharedFamilies('ckb'), getSharedFamilies('ku'));
  assert.equal(localStorage.getItem('rcm_shared_families_ckb'), null);
});

test('does not replace actual names, new identities, or unrelated families with demonstration data', () => {
  const family = getInitialFamilies('zh')[0];
  family.members[0].name = 'Corrected Registered Name';
  family.members[1].nationalId = 'DIFFERENT-PERSON';
  family.members.push({ id: 'NEW', nationalId: 'NEW-PERSON', name: 'English Demonstration Name' });
  const repaired = localizeDemoFamilyNames(family, 'ar');
  assert.equal(repaired.members[0].name, 'Corrected Registered Name');
  assert.equal(repaired.members[1].name, family.members[1].name);
  assert.equal(repaired.members.at(-1).name, 'English Demonstration Name');
  const other = { ...family, rationCardNo: 'REAL-CARD', headName: 'Original Registered Head' };
  assert.equal(localizeDemoFamilyNames(other, 'ar'), other);
});

test('full member-array edits share phone and qualification changes without overwriting localized names', () => {
  const source = getSharedFamily(cardNo, 'zh');
  source.members[0].phone = 'changed-phone';
  source.members[2].status = 'Frozen';
  source.members[2].freezeReason = 'BUSINESS';
  updateSharedFamily(cardNo, { members: source.members }, 'zh');
  for (const lang of languages) {
    const family = getSharedFamily(cardNo, lang);
    assert.deepEqual(family.members.map(m => m.name), getInitialFamilies(lang)[0].members.map(m => m.name));
    assert.equal(family.members[0].phone, 'changed-phone');
    assert.equal(family.members[2].freezeReason, 'BUSINESS');
    assert.match(family.members[2].status, /Frozen|مجمد|بەستراوە/);
  }
});

test('retains custom locale names and does not infer an identity from an unrelated name', () => {
  for (const lang of languages) {
    const family = getSharedFamily(cardNo, lang);
    family.members.push({ id: 'CUSTOM', nationalId: 'CUSTOM-PERSON', name: lang + '-registered-name', phone: 'old' });
    localStorage.setItem('rcm_shared_families_' + lang, JSON.stringify([family]));
  }
  const source = getSharedFamily(cardNo, 'zh');
  source.members.at(-1).phone = 'updated';
  updateSharedFamily(cardNo, { members: source.members }, 'zh');
  for (const lang of languages) {
    const member = getSharedFamily(cardNo, lang).members.at(-1);
    assert.equal(member.name, lang + '-registered-name');
    assert.equal(member.phone, 'updated');
  }
  source.members.at(-1).name = 'Corrected English Name';
  updateSharedFamily(cardNo, { members: source.members }, 'zh');
  for (const lang of languages) assert.equal(getSharedFamily(cardNo, lang).members.at(-1).name, 'Corrected English Name');
});

test('adding and removing members shares the actual roster without recreating removed members', () => {
  const source = getSharedFamily(cardNo, 'en');
  const addition = { id: 'NEW', nationalId: 'NEW-PERSON', name: 'English Demo Member', phone: '' };
  source.members.push(addition);
  updateSharedFamily(cardNo, { members: source.members, memberCount: source.members.length }, 'en');
  for (const lang of languages) {
    const family = getSharedFamily(cardNo, lang);
    assert.equal(family.members.at(-1).name, addition.name);
    assert.equal(family.memberCount, 5);
  }
  source.members = source.members.filter(member => member.id !== 'M-003');
  updateSharedFamily(cardNo, { members: source.members, memberCount: source.members.length }, 'en');
  for (const lang of languages) {
    const family = getSharedFamily(cardNo, lang);
    assert.equal(family.members.some(member => member.id === 'M-003'), false);
    assert.equal(family.memberCount, 4);
  }
});

test('head succession and callback updates preserve each language and return the requested locale', () => {
  const source = getSharedFamily(cardNo, 'en');
  updateSharedFamily(cardNo, { members: source.members, headName: source.members[1].name }, 'en');
  for (const lang of languages) assert.equal(getSharedFamily(cardNo, lang).headName, getInitialFamilies(lang)[0].members[1].name);
  const result = updateSharedFamily(cardNo, (family, lang) => ({ ...family, verifiedLocale: lang }), 'ckb');
  assert.equal(result.verifiedLocale, 'ku');
  assert.equal(result.members[0].name, getInitialFamilies('ku')[0].members[0].name);
});
