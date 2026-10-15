import fs from 'fs';
import path from 'path';

// 旧色板(深墨绿+暗砂金) -> 参考站新色板(鼠尾草绿 + 亮砂金 + 薄荷绿)
const MAP = {
  // 深绿系
  '1E3F35': '326445', '142B24': '2A5440', '152E27': '2A5440', '17332B': '1F3326',
  '16332B': '1F3326', '1A2E26': '1F3326', '142C25': '1F3326', '142B23': '1F3326',
  '142D25': '12241A', '122820': '12241A', '122821': '12241A', '0A1612': '12241A',
  '0A1F17': '12241A', '0A2318': '12241A', '0D201A': '12241A', '090D16': '1A241E',
  '005A2D': '2A5440', '004221': '24483A', '275A3E': '326445', '007A3D': '326445',
  '285246': '2F5B44', '295447': '2F5B44', '244C40': '2F5B44', '2B5448': '2F5B44',
  '2A5347': '2F5B44', '2B564A': '2F5B44', '285447': '2F5B44', '2E5E50': '35654F',
  '18392F': '2A5440', '1FA35E': '3E8A5E', '2C6E49': '2F7A50', '2E7D32': '2F7A50',
  '059669': '2F7A50', '065F46': '2F5B44', '064E3B': '24483A', '52C41A': '2F7A50',
  '10B981': '3E9B68', '34D399': '6FBF92', '6EE7B7': 'A7D9BC', 'A7F3D0': 'C7E9D5',
  '0D9488': '34856B', '4A6E64': '5C8A6B', '6F8E84': '7FA48C', '9EB6AE': 'AECBB8',
  'C8D7D2': 'C7DED0', 'EAF1EE': 'E1F4E4',
  // 中性文字/背景 (暖灰 -> 鼠尾草灰绿)
  '18231E': '1F3326', '5E6862': '58685D', '8C958F': '8A9A8F', 'B4BCB7': 'B3C1B7',
  '5E7368': '58685D', '7A827D': '8A9A8F', '7A8E84': '8A9A8F', '4A5C53': '58685D',
  '3E4B45': '43554B', '6A7985': '58685D',
  '0F172A': '1F3326', '1E293B': '2A3A30', '334155': '43554B', '475569': '58685D',
  '64748B': '58685D', '94A3B8': '8A9A8F', 'CBD5E1': 'C9DBCE', 'E2E8F0': 'D9E5DB',
  'F1F5F9': 'EFF5F1', 'F8FAFC': 'F8FBF8', 'EEF2F6': 'E9F1EB',
  // 画布/卡片底色与边框
  'F8F7F3': 'F8FBF8', 'F7F6F1': 'F8FBF8', 'F8F6F1': 'F3F8F4', 'FAF8F4': 'F3F8F4',
  'FAF8F5': 'F3F8F4', 'FBF9F5': 'F3F8F4', 'FBFBFA': 'F3F8F4', 'FCFBF8': 'F3F9F5',
  'FCFBF9': 'F3F9F5', 'FDFCF9': 'FBFDFB', 'FCFDFD': 'FBFDFB', 'FFFBFB': 'FBFDFB',
  'F4F1EA': 'E9F1EB', 'F4EFE6': 'E9F1EB', 'ECE7DE': 'D9E5DB', 'EFECE6': 'D9E5DB',
  'E8E3D8': 'D9E5DB', 'EAE5DA': 'D9E5DB', 'E3D9C8': 'D3E2D6', 'DFD9CC': 'C4D6C8',
  'DFD9CE': 'C4D6C8', 'DFE8E3': 'E9F1EB', 'D5E5DC': 'CFE2D5', 'D1E7DA': 'CFE2D5',
  'D6E6DC': 'C7E0CE', 'C3E6D2': 'C7E0CE', 'CDE1D4': 'C7E0CE', 'A6C4BA': 'AECBB8',
  '9EB5AC': 'AECBB8', 'DCE8E1': 'D9E5DB', 'E2EDE6': 'E9F1EB', 'EAF6EF': 'E1F4E4',
  'EAF5EF': 'E1F4E4', 'EDF6F1': 'E1F4E4', 'E4F2E9': 'E1F4E4', 'E8F5E9': 'E1F4E4',
  'C8E6C9': 'C7E0CE', 'D8F0E2': 'CFE2D5', 'F2F9F5': 'F3F9F5', 'F7FAF8': 'F3F9F5',
  // 砂金系
  'C59D5F': 'D3AF62', 'D3A757': 'D3AF62', 'D4AA6A': 'D3AF62', 'AA8246': 'B8934A',
  'B88B4A': 'B8934A', 'B08B50': 'B8934A', 'B58542': 'B8934A', '966C2E': '7A5F21',
  '916F34': '7A5F21', '7A5B22': '7A5F21', '78350F': '6B5321', 'B45309': '9A7A2F',
  'E8D9BF': 'E5CEA1', 'FAF5ED': 'FDF3E0', 'FAF3E6': 'FDF3E0', 'FAF6EE': 'FDF3E0',
  'F7EEDB': 'FDF3E0', 'F4E8D1': 'FDF3E0', 'F5ECE0': 'FDF3E0', 'F2E3C6': 'EED9AE',
  'E5C388': 'E5CEA1', 'E2C38E': 'E5CEA1', 'E4BA76': 'D9B567', 'DFC187': 'DFC08B',
  'E2C79F': 'E5CEA1', 'EFE0C7': 'EED9AE', 'D4B27E': 'DFC08B', 'DEB365': 'D8B46C',
  'C49646': 'CBA457', 'C59846': 'C3A053', 'E5C888': 'E5CEA1', '8E703E': 'A98A45',
  'E8DCC6': 'E5CEA1', 'E5DAC8': 'E5CEA1',
  // 琥珀/黄/橙 -> 金
  'F59E0B': 'D9B567', 'FBBF24': 'D9B567', 'FCD34D': 'DFBE7C', 'FDE68A': 'E9D5A3',
  'EAB308': 'C9A13B', 'F97316': 'C08348',
  // 砖红系
  'D34545': 'C04442', 'D04343': 'C04442', 'DC3545': 'C04442', 'EF4444': 'C04442',
  'DC2626': 'A93B39', 'F43F5E': 'C04442', 'E11D48': 'C04442', 'F87171': 'D0827F',
  'FCA5A5': 'E8B7B5', '7F1D1D': '6E2F2E',
  'FEECEC': 'FBEAE9', 'FCD5D5': 'F2D5D4', 'FBD7D7': 'F2D5D4', 'FDE8E8': 'FBEAE9',
  'FAD8D8': 'F2D5D4',
};

// rgba 旧暖色调 -> 新暖绿色调
const RGBA_MAP = [
  [/rgba\(60,\s*48,\s*25/g, 'rgba(47, 68, 52'],
  [/rgba\(30,\s*63,\s*53/g, 'rgba(50, 100, 69'],
  [/rgba\(211,\s*167,\s*87/g, 'rgba(211, 175, 98'],
  [/rgba\(197,\s*157,\s*95/g, 'rgba(211, 175, 98'],
  [/rgba\(31,\s*163,\s*94/g, 'rgba(62, 138, 94'],
  [/rgba\(0,\s*122,\s*61/g, 'rgba(50, 100, 69'],
  [/rgba\(220,\s*53,\s*69/g, 'rgba(192, 68, 66'],
];

const ROUND_MAP = [
  [/rounded-2xl\b/g, 'rounded-lg'],
  [/rounded-xl\b/g, 'rounded-lg'],
];

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (/\.(vue|js|scss|css|html)$/.test(f)) files.push(p);
  }
  return files;
}

const targets = [...walk('src'), 'index.html'];
let changed = 0;
for (const file of targets) {
  const original = fs.readFileSync(file, 'utf8');
  let t = original;
  t = t.replace(/#[0-9a-fA-F]{6}\b/g, (hex) => {
    const rep = MAP[hex.slice(1).toUpperCase()];
    return rep ? '#' + rep : hex;
  });
  for (const [re, to] of RGBA_MAP) t = t.replace(re, to);
  if (file.endsWith('.vue')) for (const [re, to] of ROUND_MAP) t = t.replace(re, to);
  if (t !== original) {
    fs.writeFileSync(file, t);
    changed++;
    console.log('updated:', file);
  }
}
console.log('total files changed:', changed);
