import test from 'node:test';
import assert from 'node:assert/strict';
import { scanOrderText, scanItemName, scanUnitKey } from '../../src/utils/scanOrderDisplay.js';
import messages from '../../src/locales/scanHandover.js';

test('localizes known recipients and complete addresses without changing street or unit numbers', () => {
  for (const language of ['en', 'ar', 'ckb']) {
    assert.ok(!/[\u4e00-\u9fff]/.test(scanOrderText('艾哈迈德·哈桑·萨利赫', 'recipient', language)));
    const address = scanOrderText('巴格达省卡尔赫区海法街88号 3号楼201', 'address', language);
    assert.ok(!/[\u4e00-\u9fff]/.test(address));
    if (language === 'en') { assert.match(address, /Haifa/); assert.match(address, /88/); assert.match(address, /201/); assert.doesNotMatch(address, /Mansour/); }
  }
});
test('preserves custom recipient and address content, including edits to known demo addresses', () => {
  const edited = '巴格达省卡尔赫区海法街88号 3号楼202';
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    assert.equal(scanOrderText(edited, 'address', lang), edited);
    assert.equal(scanOrderText('Custom recipient 42', 'recipient', lang), 'Custom recipient 42');
    assert.equal(scanOrderText('Other Street 14 Building 7 Unit 99', 'address', lang), 'Other Street 14 Building 7 Unit 99');
  }
});
test('switches translated fields between languages and preserves the stored order', () => {
  const name = scanOrderText('艾哈迈德·哈桑·萨利赫', 'recipient', 'en');
  assert.equal(scanOrderText(name, 'recipient', 'zh'), '艾哈迈德·哈桑·萨利赫');
  assert.ok(scanOrderText(name, 'recipient', 'ckb').includes('ئەحمەد'));
});
test('renders commodity names from stable codes even when the QR order omitted names or units', () => {
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    for (const code of ['FLOUR-WHT-02', 'RICE-BAS-01', 'OIL-SUN-03', 'SUGAR-WHT-04']) {
      const name = scanItemName({ itemCode: code }, lang);
      assert.ok(name && name !== code);
      if (lang !== 'zh') assert.ok(!/[\u4e00-\u9fff]/.test(name));
      assert.equal(scanUnitKey({ itemCode: code }), code === 'OIL-SUN-03' ? 'unitLitre' : 'unitKg');
    }
  }
  assert.equal(scanItemName({ itemCode: 'OTHER', itemName: 'Custom goods' }, 'ar'), 'Custom goods');
  assert.equal(scanUnitKey({ unit: '公斤 (KG)' }), 'unitKg');
  assert.equal(scanUnitKey({ unit: 'L' }), 'unitLitre');
});
test('compact handover labels are translated in all four catalogs', () => {
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    assert.deepEqual(Object.keys(messages[lang]).sort(), Object.keys(messages.zh).sort());
    for (const text of Object.values(messages[lang])) assert.ok(text);
  }
});
