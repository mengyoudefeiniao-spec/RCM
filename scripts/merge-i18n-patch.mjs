/**
 * 合并 ar/ku 缺失词条补丁到语言包
 * 用法: node scripts/merge-i18n-patch.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const patchDir = path.join(root, 'scripts', 'i18n-patch');

// 动态加载语言包（ESM，Windows 路径需转 file:// URL）
const importLocal = (p) => import(pathToFileURL(p).href);
const arMod = await importLocal(path.join(root, 'src', 'locales', 'ar.js'));
const kuMod = await importLocal(path.join(root, 'src', 'locales', 'ku.js'));
const enMod = await importLocal(path.join(root, 'src', 'locales', 'en.js'));
const ar = arMod.default;
const ku = kuMod.default;
const en = enMod.default;

// 汇总补丁
function loadPatches(prefix) {
  const merged = {};
  const files = readdirSync(patchDir).filter(f => f.startsWith(prefix) && f.endsWith('.json')).sort();
  for (const f of files) {
    Object.assign(merged, JSON.parse(readFileSync(path.join(patchDir, f), 'utf8')));
  }
  return merged;
}

const arPatch = loadPatches('ar-part');
const kuPatch = loadPatches('ku-part');
const enPatch = loadPatches('en-part');

// 基准：zh 与 ar/ku 的键差异（缺失清单）
const zhMod = await importLocal(path.join(root, 'src', 'locales', 'zh.js'));
function flat(o, p = '') {
  let r = {};
  for (const k in o) {
    const kk = p ? p + '.' + k : k;
    if (typeof o[k] === 'object' && o[k] !== null) r = { ...r, ...flat(o[k], kk) };
    else r[kk] = o[k];
  }
  return r;
}
const fz = flat(zhMod.default);
const fa = flat(ar);
const fk = flat(ku);
const fe = flat(en);
const missingAr = Object.keys(fz).filter(k => !(k in fa));
const missingKu = Object.keys(fz).filter(k => !(k in fk));
const missingEn = Object.keys(fz).filter(k => !(k in fe));

const unAr = missingAr.filter(k => !(k in arPatch));
const unKu = missingKu.filter(k => !(k in kuPatch));
const unEn = missingEn.filter(k => !(k in enPatch));
if (unAr.length || unKu.length || unEn.length) {
  console.error('补丁未覆盖的缺失键 ar:', unAr);
  console.error('补丁未覆盖的缺失键 ku:', unKu);
  console.error('补丁未覆盖的缺失键 en:', unEn);
  process.exit(1);
}

// 将扁平键写入嵌套对象
function setDeep(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}
for (const [k, v] of Object.entries(arPatch)) setDeep(ar, k, v);
for (const [k, v] of Object.entries(kuPatch)) setDeep(ku, k, v);
for (const [k, v] of Object.entries(enPatch)) setDeep(en, k, v);

// 回写（保留 export default 结构，2 空格缩进）
writeFileSync(path.join(root, 'src', 'locales', 'ar.js'), 'export default ' + JSON.stringify(ar, null, 2) + '\n', 'utf8');
writeFileSync(path.join(root, 'src', 'locales', 'ku.js'), 'export default ' + JSON.stringify(ku, null, 2) + '\n', 'utf8');
writeFileSync(path.join(root, 'src', 'locales', 'en.js'), 'export default ' + JSON.stringify(en, null, 2) + '\n', 'utf8');
console.log(`已合并: ar +${Object.keys(arPatch).length} 键, ku +${Object.keys(kuPatch).length} 键, en +${Object.keys(enPatch).length} 键`);
