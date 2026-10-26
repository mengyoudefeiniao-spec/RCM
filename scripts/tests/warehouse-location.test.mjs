import test from 'node:test';
import assert from 'node:assert/strict';
import { warehousePosition, warehouseNavigationUrl } from '../../src/utils/warehouseLocation.js';
import { DEMO_CENTER_WAREHOUSE_LOCATIONS } from '../../src/mock/data/centerWarehouseLocations.js';
import messages from '../../src/locales/warehouseLocation.js';

test('uses warehouse coordinates and never substitutes the agent outlet location', () => {
  assert.deepEqual(warehousePosition({ warehouseLocation: { latitude: '34.5', longitude: '45.2' }, gisCoords: { lat: 1, lng: 2 } }), { lat: 34.5, lng: 45.2, source: 'record' });
  assert.equal(warehousePosition({ gisCoords: { lat: 1, lng: 2 }, lat: 1, lng: 2 }), null);
  assert.deepEqual(warehousePosition({ warehouseCoords: { lat: 0, lng: 0 } }), { lat: 0, lng: 0, source: 'record' });
});
test('rejects missing, empty and invalid warehouse coordinates', () => {
  for (const location of [null, {}, { lat: null, lng: 44 }, { lat: false, lng: 44 }, { lat: [], lng: 44 }, { lat: '', lng: 44 }, { lat: 33, lng: ' ' }, { lat: 91, lng: 44 }, { lat: 33, lng: -181 }, { lat: 'bad', lng: 44 }, { lat: Infinity, lng: 44 }]) assert.equal(warehousePosition({ warehouseLocation: location }), null);
});
test('demo centers have separate destinations and explicit demonstration metadata', () => {
  assert.notDeepEqual(DEMO_CENTER_WAREHOUSE_LOCATIONS['101'], DEMO_CENTER_WAREHOUSE_LOCATIONS['496']);
  for (const location of Object.values(DEMO_CENTER_WAREHOUSE_LOCATIONS)) assert.equal(warehousePosition({ warehouseLocation: location }).source, 'demo');
});
test('Google navigation targets the warehouse and only includes an origin after geolocation', () => {
  const destination = { lat: 33.3152, lng: 44.3535 };
  const withoutOrigin = new URL(warehouseNavigationUrl(destination));
  assert.equal(withoutOrigin.searchParams.get('destination'), '33.3152,44.3535');
  assert.equal(withoutOrigin.searchParams.get('origin'), null);
  assert.equal(new URL(warehouseNavigationUrl(destination, { lat: 1, lng: 2 })).searchParams.get('origin'), '1,2');
  assert.equal(warehouseNavigationUrl(null), '');
});
test('all warehouse map copy is available in four languages', () => {
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    assert.deepEqual(Object.keys(messages[lang]).sort(), Object.keys(messages.zh).sort());
    for (const value of Object.values(messages[lang])) assert.ok(value.trim());
    if (lang !== 'zh') assert.ok(!/[\u4e00-\u9fff]/.test(Object.values(messages[lang]).join('')));
  }
});
