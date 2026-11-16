import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REGISTRATION_CATALOG_KEY,
  REGISTRATION_LANGUAGES,
  REGISTRATION_PROVINCE_CODES,
  buildRegistrationCatalog,
  findRegistrationAgency,
  findRegistrationProvince,
  isValidRegistrationCatalog,
  localizeCatalogNames,
  normalizeRegistrationLang
} from '../../src/utils/registrationCatalog.js';

const catalog = buildRegistrationCatalog();

test('catalog seeds every province and agency with a stable code', () => {
  assert.equal(REGISTRATION_CATALOG_KEY, 'rcm_shared_registration_catalog');
  assert.deepEqual(catalog.provinces.map(province => province.code), [...REGISTRATION_PROVINCE_CODES]);
  assert.equal(isValidRegistrationCatalog(catalog), true);
  const agencyCodes = catalog.provinces.flatMap(province => province.agencies.map(agency => agency.code));
  assert.equal(new Set(agencyCodes).size, agencyCodes.length);
  assert.ok(agencyCodes.includes('BAG-KARKH-01'));
  assert.ok(agencyCodes.includes('BAS-PORT-01'));
});

test('every province and agency carries all four language names', () => {
  const entries = catalog.provinces.flatMap(province => [province, ...province.agencies]);
  for (const entry of entries) {
    for (const lang of REGISTRATION_LANGUAGES) {
      assert.ok(entry.names[lang] && entry.names[lang].trim(), `${entry.code} missing ${lang}`);
    }
  }
  const basra = findRegistrationProvince(catalog, 'basra');
  assert.equal(basra.names.en, 'Basra Province');
  assert.equal(basra.names.ar, 'محافظة البصرة');
  assert.equal(basra.names.ckb, 'پارێزگای بەسرە');
});

test('agencies map the ration centers of their province', () => {
  const baghdad = findRegistrationProvince(catalog, 'baghdad');
  assert.deepEqual(baghdad.agencies.map(agency => agency.code), ['BAG-KARKH-01', 'BAG-RUSAFA-02']);
  assert.deepEqual(baghdad.agencies[0].centerIds, ['101', '102']);
  assert.deepEqual(findRegistrationAgency(catalog, 'basra', 'BAS-PORT-01').centerIds, ['201']);
  assert.equal(findRegistrationAgency(catalog, 'basra', 'BAG-KARKH-01'), null);
  assert.equal(findRegistrationAgency(catalog, 'unknown', 'BAS-PORT-01'), null);
});

test('names resolve for the current UI language and the legacy ku code', () => {
  const names = findRegistrationProvince(catalog, 'kirkuk').names;
  assert.equal(localizeCatalogNames(names, 'ar'), 'محافظة كركوك');
  assert.equal(localizeCatalogNames(names, 'ckb'), 'پارێزگای کەرکووک');
  assert.equal(localizeCatalogNames(names, 'ku'), 'پارێزگای کەرکووک');
  assert.equal(localizeCatalogNames(names, 'en'), 'Kirkuk Province');
  assert.equal(localizeCatalogNames(null, 'en'), '');
  assert.equal(normalizeRegistrationLang('ku'), 'ckb');
  assert.equal(normalizeRegistrationLang('fr'), 'zh');
});

test('invalid catalogs are rejected before they are shared', () => {
  assert.equal(isValidRegistrationCatalog(null), false);
  assert.equal(isValidRegistrationCatalog({ provinces: [] }), false);
  assert.equal(isValidRegistrationCatalog({ provinces: [{ code: 'x', names: { zh: 'x' }, agencies: [] }] }), false);
  assert.equal(isValidRegistrationCatalog({ provinces: [{ code: 'x', names: { zh: 'x' }, agencies: [{ code: 'a', names: { zh: 'a' }, centerIds: [] }] }] }), false);
});
