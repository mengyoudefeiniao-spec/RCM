import test from 'node:test';
import assert from 'node:assert/strict';
import { getInitialFamilies } from '../../src/utils/sharedSession.js';
import { buildCitizenCardVerification, verifiedCitizenCardPayload } from '../../src/utils/citizenCardScan.js';
import { evaluateCitizenCardScan, computeRemainingQuota } from '../../src/utils/scanStatusGuard.js';
import { createCitizenCardQrPayload, createPickupOrderQrPayload, parseRcmQrPayload } from '../../src/utils/qrPayload.js';
import messages from '../../src/locales/scanHandover.js';

const now = new Date('2026-10-26T04:00:00Z');
const quotas = [{ quotaPerHead: 3 }, { quotaPerHead: 9 }, { quotaPerHead: 1 }, { quotaPerHead: 1 }];

test('all four family locales count the same eligible members and accept the card', () => {
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    const family = getInitialFamilies(lang)[0];
    const verification = buildCitizenCardVerification(family, [], quotas, now);
    assert.equal(verification.eligibleMembers, 3, lang);
    const card = JSON.parse(createCitizenCardQrPayload(family, 'VERIFY-TEST'));
    assert.equal(evaluateCitizenCardScan(card, { verification }), null, 'A frozen member does not invalidate the entire family: ' + lang);
  }
});

test('duplicate claims use the actual month of claimTime in every language', () => {
  const family = getInitialFamilies('en')[0];
  for (const periodText of ['2026年10月份配额', 'October 2026', '2026-10']) {
    const current = buildCitizenCardVerification(family, [{ rationCardNo: family.rationCardNo, claimPeriod: periodText, claimTime: '2026-10-12 09:00:00' }], quotas, now);
    assert.equal(current.alreadyClaimed, true);
    assert.equal(evaluateCitizenCardScan({ cardNo: family.rationCardNo }, { verification: current }).code, 'ERR_DUPLICATE');
  }
  assert.equal(buildCitizenCardVerification(family, [{ rationCardNo: family.rationCardNo, claimTime: '2026-09-25 09:00:00' }], quotas, now).alreadyClaimed, false);
});

test('card details come from the matching persisted family rather than stale QR fields', () => {
  const family = getInitialFamilies('en')[0];
  const card = verifiedCitizenCardPayload({ cardNo: family.rationCardNo, headName: 'STALE', memberCount: 99, verificationCode: 'VERIFY-ORIGINAL', issuedAt: now.toISOString() }, { family });
  assert.equal(card.headName, family.headName); assert.equal(card.memberCount, 4);
  assert.equal(card.verificationCode, 'VERIFY-ORIGINAL'); assert.equal(card.issuedAt, now.toISOString());
  assert.throws(() => verifiedCitizenCardPayload({ cardNo: 'UNKNOWN' }, { family }), /card-not-found/);
  assert.throws(() => verifiedCitizenCardPayload({ cardNo: family.rationCardNo }, {}), /card-not-found/);
});

test('quota calculations respect remaining amounts and changed per-person rules', () => {
  assert.equal(computeRemainingQuota([{ remainingQuota: 8, claimedQty: 2 }]), 8);
  assert.equal(computeRemainingQuota([{ totalQuota: 10, claimedQty: 2 }]), 8);
  const verification = { eligibleMembers: 2, quotaList: [{ quotaPerHead: 5, totalQuota: 10 }] };
  assert.equal(evaluateCitizenCardScan({ cardNo: 'CARD', memberCount: 4 }, { verification }), null);
  assert.equal(evaluateCitizenCardScan({ cardNo: 'CARD' }, { verification, requestedQty: 11 }).code, 'ERR_QUOTA');
  assert.equal(evaluateCitizenCardScan({ cardNo: 'CARD', memberCount: 4 }, { verification: { eligibleMembers: 0, quotaList: [{ totalQuota: 0 }] } }).code, 'ERR_QUOTA', 'Zero eligible members cannot authorize dispatch');
});

test('freezing, cancellation, loss and expiry still block dispatch after identification', () => {
  for (const status of ['冻结', 'Frozen', 'مجمد', 'بەستراوە']) assert.equal(evaluateCitizenCardScan({ cardNo: 'CARD', status }).code, 'ERR_FROZEN');
  for (const status of ['注销', 'Cancelled', 'ملغى', 'هەڵوەشاوە', '挂失', 'Lost', 'مفقود', 'ونبوو']) assert.equal(evaluateCitizenCardScan({ cardNo: 'CARD', status }).code, 'ERR_CARD');
  assert.equal(evaluateCitizenCardScan({ cardNo: 'CARD', issuedAt: '2026-10-26T03:00:00Z' }, { now: +now }).code, 'ERR_EXPIRED');
});

test('pickup orders and all four citizen card QR payloads retain distinct workflows', () => {
  assert.deepEqual(parseRcmQrPayload(createPickupOrderQrPayload('PK-TEST')), { type: 'pickup-order', pickupCode: 'PK-TEST' });
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    const result = parseRcmQrPayload(createCitizenCardQrPayload(getInitialFamilies(lang)[0], 'VERIFY-TEST'));
    assert.equal(result.type, 'citizen-card'); assert.equal(result.payload.cardNo, 'RC-10029381');
    assert.equal(result.payload.version, 2);
    assert.ok(Buffer.byteLength(JSON.stringify(result.payload)) < 220, 'Sparse code remains readable on a phone');
  }
  assert.equal(parseRcmQrPayload(JSON.stringify({ type: 'rcm-citizen-card', version: 1, cardNo: 'RC-10029381', headName: 'Legacy name', memberCount: 4 })).type, 'citizen-card', 'Existing card codes remain supported');
});

test('scan input labels and validation messages are available in all four languages', () => {
  const keys = Object.keys(messages.en).sort();
  for (const [lang, pack] of Object.entries(messages)) {
    assert.deepEqual(Object.keys(pack).sort(), keys, lang);
    for (const key of keys) assert.ok(pack[key], lang + '.' + key);
  }
});
