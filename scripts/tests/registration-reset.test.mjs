import test from 'node:test';
import assert from 'node:assert/strict';
import { collectRegistrationConflicts, normalizeRegistrationPhone } from '../../src/utils/registrationReset.js';

const accounts = [
  { nationalId: '198004198271', phone: '07801234567', rationCardNo: 'RC-77120458', paperCardNo: 'IQ-P-1994-082194' },
  { nationalId: '200001010001', phone: '07709998888', rationCardNo: 'RC-10029381', paperCardNo: '' }
];

test('phone numbers compare without spaces or dashes', () => {
  assert.equal(normalizeRegistrationPhone(' 0780-123 4567 '), '07801234567');
});

test('an existing national ID matches its account and all clearable cards', () => {
  const { conflicts, cardNos, nationalIds } = collectRegistrationConflicts(accounts, { nationalId: '198004198271' });
  assert.equal(conflicts.length, 1);
  assert.deepEqual(cardNos.sort(), ['IQ-P-1994-082194', 'RC-77120458']);
  assert.deepEqual(nationalIds, ['198004198271']);
});

test('the same phone number or ration card also identifies the old account', () => {
  assert.equal(collectRegistrationConflicts(accounts, { phone: '0780 123 4567' }).conflicts.length, 1);
  assert.equal(collectRegistrationConflicts(accounts, { rationCardNo: ' rc-77120458 ' }).conflicts.length, 1);
  assert.equal(collectRegistrationConflicts(accounts, { rationCardNo: 'RC-10029381' }).conflicts[0].nationalId, '200001010001');
});

test('a new registration always carries its own card and national ID for the reset', () => {
  const { conflicts, cardNos, nationalIds } = collectRegistrationConflicts(accounts, { nationalId: '199901010000', rationCardNo: 'RC-NEW-01' });
  assert.equal(conflicts.length, 0);
  assert.deepEqual(cardNos, ['RC-NEW-01']);
  assert.deepEqual(nationalIds, ['199901010000']);
});

test('missing accounts or identifiers never throw', () => {
  assert.deepEqual(collectRegistrationConflicts(null, {}), { conflicts: [], cardNos: [], nationalIds: [] });
  assert.deepEqual(collectRegistrationConflicts(accounts, { nationalId: '', phone: '', rationCardNo: '' }).conflicts, []);
});
