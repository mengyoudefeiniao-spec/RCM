import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARD_TYPES,
  normalizeCardType,
  cardTypeNeedsScan,
  normalizeRationCardNo,
  isValidRationCardNo,
  isValidNationalId,
  isValidPhone,
  provinceCodeAt,
  provisionalRationCardNo
} from '../../src/utils/registrationCard.js';

test('unknown card types fall back to the no-card path', () => {
  assert.equal(normalizeCardType('paper'), CARD_TYPES.PAPER);
  assert.equal(normalizeCardType('electronic'), CARD_TYPES.ELECTRONIC);
  assert.equal(normalizeCardType('nonsense'), CARD_TYPES.NONE);
  assert.equal(normalizeCardType(undefined), CARD_TYPES.NONE);
  assert.equal(cardTypeNeedsScan(CARD_TYPES.PAPER), true);
  assert.equal(cardTypeNeedsScan(CARD_TYPES.ELECTRONIC), true);
  assert.equal(cardTypeNeedsScan(CARD_TYPES.NONE), false);
});

test('card numbers are normalised and validated before registration', () => {
  assert.equal(normalizeRationCardNo('  iq-p-1994-082194 '), 'IQ-P-1994-082194');
  assert.equal(isValidRationCardNo('IQ-P-1994-082194'), true);
  assert.equal(isValidRationCardNo('RC-77120458'), true);
  assert.equal(isValidRationCardNo('AB'), false);
  assert.equal(isValidRationCardNo(''), false);
  assert.equal(isValidRationCardNo('CARD NO'), false);
});

test('identity and phone formats follow the registration form rules', () => {
  assert.equal(isValidNationalId('198004198271'), true);
  assert.equal(isValidNationalId('IQ-1980-0419-8271'), true);
  assert.equal(isValidNationalId('12'), false);
  assert.equal(isValidPhone('07801234567'), true);
  assert.equal(isValidPhone('+964 780 123 4567'), true);
  assert.equal(isValidPhone('123'), false);
});

test('province codes and provisional card numbers match the registry order', () => {
  assert.equal(provinceCodeAt(0), 'baghdad');
  assert.equal(provinceCodeAt(4), 'basra');
  assert.equal(provinceCodeAt(9), '');
  const provisional = provisionalRationCardNo('101');
  assert.match(provisional, /^RC-101-\d{6}$/);
  assert.equal(isValidRationCardNo(provisional), true);
});
