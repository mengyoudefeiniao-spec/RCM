import test from 'node:test';
import assert from 'node:assert/strict';
import messages from '../../src/locales/nationalCockpit.js';
import {
  COCKPIT_MAP_METRICS, COCKPIT_SCALE, cockpitColor, cockpitMetricRange,
  formatCockpitValue, normalizeCockpitOverview
} from '../../src/utils/nationalCockpit.js';
import { ORG_UNIT_TYPES, normalizeOrgUnitRow, orgUnitDisplayName, orgUnitTypeKey } from '../../src/utils/orgUnits.js';

function flattenKeys(value, prefix = '') {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, nested]) => flattenKeys(nested, prefix ? prefix + '.' + key : key)).sort();
}

function placeholders(value) {
  if (value === null || typeof value !== 'object') return String(value).match(/\{(\w+)\}/g)?.sort() || [];
  return Object.values(value).flatMap(placeholders).sort();
}

test('national cockpit and organization-unit copy stays aligned across the four locales', () => {
  const expected = flattenKeys(messages.en);
  assert.ok(expected.includes('nav.cockpit'));
  assert.ok(expected.includes('cockpit.indicators.fulfillment'));
  assert.ok(expected.includes('system.orgUnits'));
  assert.ok(expected.includes('systemUi.create_org-units'));
  assert.ok(expected.includes('systemExtras.entityOrgUnit'));
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    assert.deepEqual(flattenKeys(messages[lang]), expected);
    assert.deepEqual(placeholders(messages[lang]), placeholders(messages.en));
    if (lang !== 'zh') assert.ok(!/[\u4e00-\u9fff]/.test(JSON.stringify(messages[lang])), lang + ' must not leak Chinese copy');
  }
});

test('cockpit values keep numeric data locale-neutral and localize only presentation', () => {
  assert.equal(formatCockpitValue(1234567, 'people', 'en'), '1,234,567');
  assert.equal(formatCockpitValue(99.86, 'percent', 'zh'), '99.9');
  assert.equal(formatCockpitValue(null, 'people', 'en'), '—');
  assert.equal(formatCockpitValue('abc', 'people', 'en'), '—');
});

test('normalizes the PocketBase cockpit record and clamps map colors', () => {
  const overview = normalizeCockpitOverview({
    updatedAt: '2026-11-16T10:00:00.000Z',
    indicators: [{ key: 'population', value: '8126755', unit: 'people', trend: '0.8', tone: 'good' }, { key: '', value: 1 }],
    provinces: [
      { provinceCode: 'BAG', population: '8126755', households: '2000000', fulfillment: '99.4', agents: '9800', sites: '400' },
      { provinceCode: 'BAS', households: '700000', fulfillment: '98.9' }
    ]
  });
  assert.equal(overview.indicators.length, 1);
  assert.equal(overview.indicators[0].value, 8126755);
  assert.equal(overview.provinces[0].population, 8126755);
  assert.equal(overview.provinces[1].fulfillment, 98.9);
  assert.deepEqual(cockpitMetricRange(overview.provinces, 'households'), [700000, 2000000]);
  assert.equal(formatCockpitValue(overview.provinces[0].population, 'people', 'en'), '8,126,755');
  assert.deepEqual(COCKPIT_MAP_METRICS, ['fulfillment', 'households', 'agents', 'sites']);
  assert.equal(cockpitColor(-1), COCKPIT_SCALE[0]);
  assert.equal(cockpitColor(2), COCKPIT_SCALE[COCKPIT_SCALE.length - 1]);
  assert.equal(cockpitColor(0.5).length, 7);
});

test('organization units keep user and role links while demo names stay localizable', () => {
  assert.deepEqual(ORG_UNIT_TYPES, ['ministry', 'directorate', 'branch', 'center']);
  assert.equal(orgUnitTypeKey('branch'), 'orgTypeBranch');
  assert.equal(orgUnitTypeKey('unknown'), 'orgTypeCenter');
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    assert.ok(messages[lang].systemExtras[orgUnitTypeKey('ministry')]);
  }
  const normalized = normalizeOrgUnitRow({ id: 'ou-9', code: ' mot-x ', type: 'division', userIds: ['web-1', 'web-1', ''], roleIds: 'role-admin' });
  assert.equal(normalized.code, 'MOT-X');
  assert.equal(normalized.type, 'center');
  assert.deepEqual(normalized.userIds, ['web-1']);
  assert.deepEqual(normalized.roleIds, []);
  assert.equal(orgUnitDisplayName({ nameKey: 'system.orgUnitDemoMinistry' }, (key) => key), 'system.orgUnitDemoMinistry');
  assert.equal(orgUnitDisplayName({ name: 'Custom Unit' }, (key) => key), 'Custom Unit');
  assert.equal(orgUnitDisplayName({}, (key) => key), '—');
});
