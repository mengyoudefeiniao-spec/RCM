import test from 'node:test';
import assert from 'node:assert/strict';
import {
  headPhoneRequiresVerification,
  sameSpecialStatus,
  memberUpdateChanges,
  isMemberUpdateProofValid,
  normalizePhoneNumber,
  matchesMemberUpdateTarget,
  MEMBER_UPDATE_PROOF_MAX_SIZE
} from '../../src/utils/memberUpdate.js';

const head = { id: 'M-001', nationalId: '197582910481', name: 'Head', relation: '户主', phone: '07701234567', residenceInfo: 'Old address', specialStatus: ['displaced'] };
const child = { id: 'M-003', nationalId: '200482910483', name: 'Child', relation: '子女', phone: '07709876543', specialStatus: [] };

const file = (type, size) => ({ name: `proof-${type}`, type, size });

test('phone numbers are normalised before comparison', () => {
  assert.equal(normalizePhoneNumber(' +964 780-123-4567 '), '+9647801234567');
  assert.equal(normalizePhoneNumber(''), '');
  assert.equal(normalizePhoneNumber(null), '');
});

test('only the household head phone change requires biometric and SMS verification', () => {
  assert.equal(headPhoneRequiresVerification(head, '07709998888'), true);
  assert.equal(headPhoneRequiresVerification(head, ' 0770 123 4567 '), false);
  assert.equal(headPhoneRequiresVerification(child, '07709998888'), false);
  assert.equal(headPhoneRequiresVerification({ ...head, relation: 'رب الأسرة' }, '07709998888'), true);
  // Clearing the head phone is still a change; the phone format rule then rejects it.
  assert.equal(headPhoneRequiresVerification(head, ''), true);
});

test('special status comparison ignores order and unknown codes', () => {
  assert.equal(sameSpecialStatus(['social_health', 'displaced'], ['displaced', 'social_health']), true);
  assert.equal(sameSpecialStatus(['displaced'], ['displaced', 'social_health']), false);
  assert.equal(sameSpecialStatus([], null), true);
  assert.equal(sameSpecialStatus(['unknown'], []), true);
});

test('member update changes separate sensitive from routine edits', () => {
  const headPhone = memberUpdateChanges(head, { phone: '07709998888', residenceInfo: 'Old address', specialStatus: ['displaced'] });
  assert.equal(headPhone.phoneChanged, true);
  assert.equal(headPhone.headPhoneChange, true);
  assert.equal(headPhone.requiresHeadPhoneVerification, true);
  assert.equal(headPhone.addressChanged, false);
  assert.equal(headPhone.specialStatusChanged, false);

  const childPhone = memberUpdateChanges(child, { phone: '07701112222', residenceInfo: child.residenceInfo, specialStatus: [] });
  assert.equal(childPhone.phoneChanged, true);
  assert.equal(childPhone.headPhoneChange, false);
  assert.equal(childPhone.requiresHeadPhoneVerification, false);

  const addressOnly = memberUpdateChanges(child, { phone: child.phone, residenceInfo: 'New address', specialStatus: [] });
  assert.equal(addressOnly.phoneChanged, false);
  assert.equal(addressOnly.addressChanged, true);
  assert.equal(addressOnly.specialStatusChanged, false);

  const statusOnly = memberUpdateChanges(head, { phone: head.phone, residenceInfo: head.residenceInfo, specialStatus: ['displaced', 'social_health'] });
  assert.equal(statusOnly.specialStatusChanged, true);
  assert.equal(statusOnly.phoneChanged, false);
});

test('proof documents accept only PDF/JPG/PNG within the size limit', () => {
  assert.equal(isMemberUpdateProofValid(file('application/pdf', 1024)), true);
  assert.equal(isMemberUpdateProofValid(file('image/jpeg', 1024)), true);
  assert.equal(isMemberUpdateProofValid(file('image/png', 1024)), true);
  assert.equal(isMemberUpdateProofValid(file('application/zip', 1024)), false);
  assert.equal(isMemberUpdateProofValid(file('application/pdf', 0)), false);
  assert.equal(isMemberUpdateProofValid(file('application/pdf', MEMBER_UPDATE_PROOF_MAX_SIZE + 1)), false);
  assert.equal(isMemberUpdateProofValid(null), false);
});

test('tickets resolve the member by id or national ID', () => {
  assert.equal(matchesMemberUpdateTarget(head, { targetMemberId: 'M-001' }), true);
  assert.equal(matchesMemberUpdateTarget(head, { targetNationalId: '197582910481' }), true);
  assert.equal(matchesMemberUpdateTarget(head, { targetMemberId: 'M-003' }), false);
  assert.equal(matchesMemberUpdateTarget(null, { targetMemberId: 'M-001' }), false);
  assert.equal(matchesMemberUpdateTarget(head, {}), false);
});
