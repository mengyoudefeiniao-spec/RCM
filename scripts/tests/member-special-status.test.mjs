import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMBER_SPECIAL_STATUS, normalizeSpecialStatus, specialStatusLabels } from '../../src/utils/memberSpecialStatus.js';

test('only known special status codes are kept and duplicates collapse', () => {
  assert.deepEqual(normalizeSpecialStatus(['displaced', 'displaced']), ['displaced']);
  assert.deepEqual(normalizeSpecialStatus(['social_health', 'unknown']), ['social_health']);
  assert.deepEqual(normalizeSpecialStatus('displaced, social_health'), ['displaced', 'social_health']);
  assert.deepEqual(normalizeSpecialStatus(' DISPLACED '), ['displaced']);
  assert.deepEqual(normalizeSpecialStatus(''), []);
  assert.deepEqual(normalizeSpecialStatus(null), []);
  assert.deepEqual(normalizeSpecialStatus(undefined), []);
});

test('labels resolve through the active catalogue for every supported language', () => {
  const catalogues = {
    zh: { 'citizenCard.specialStatusDisplaced': '流离失所', 'citizenCard.specialStatusSocialHealth': '社会救助与健康' },
    en: { 'citizenCard.specialStatusDisplaced': 'Displaced', 'citizenCard.specialStatusSocialHealth': 'Social assistance and health' }
  };
  const translate = catalogue => key => catalogue[key];
  assert.deepEqual(specialStatusLabels(translate(catalogues.zh), [MEMBER_SPECIAL_STATUS.DISPLACED]), ['流离失所']);
  assert.deepEqual(
    specialStatusLabels(translate(catalogues.en), [MEMBER_SPECIAL_STATUS.DISPLACED, MEMBER_SPECIAL_STATUS.SOCIAL_HEALTH]),
    ['Displaced', 'Social assistance and health']
  );
  assert.deepEqual(specialStatusLabels(translate(catalogues.en), []), []);
});
