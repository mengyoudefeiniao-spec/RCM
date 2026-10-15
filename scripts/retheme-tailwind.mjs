import fs from 'fs';
import path from 'path';

/**
 * 将项目内 Tailwind 默认调色板（冷灰 slate/蓝紫/冷暖杂色）统一切换为
 * 参考站 (myaid.yonsyntech.app) 的「鼠尾草政务绿 + 亮砂金 + 砖红」体系。
 * 只替换颜色，不触碰任何结构/逻辑。
 */

const SAGE = { 50: 'F3F8F4', 100: 'E9F1EB', 200: 'D9E5DB', 300: 'C9DBCE', 400: '8A9A8F', 500: '58685D', 600: '58685D', 700: '43554B', 800: '1F3326', 900: '1B3123', 950: '12241A' };
const GREEN = { 50: 'EFF5F1', 100: 'E1F4E4', 200: 'C7E0CE', 300: 'A7D9BC', 400: '6FBF92', 500: '3E9B68', 600: '2F7A50', 700: '2F5B44', 800: '24483A', 900: '12241A', 950: '12241A' };
const BRAND = { 50: 'EFF5F1', 100: 'E1F4E4', 200: 'C7DED0', 300: 'AECBB8', 400: '7FA48C', 500: '5C8A6B', 600: '326445', 700: '2A5440', 800: '24483A', 900: '1F3326', 950: '12241A' };
const GOLD = { 50: 'FDF3E0', 100: 'FDF3E0', 200: 'F2E3C6', 300: 'E5CEA1', 400: 'DFC08B', 500: 'D3AF62', 600: 'C9A13B', 700: '7A5F21', 800: '6B5321', 900: '5A4718', 950: '3F3017' };
const BRICK = { 50: 'FBEAE9', 100: 'F7E3E2', 200: 'F2D5D4', 300: 'E8B7B5', 400: 'D0827F', 500: 'C04442', 600: 'C04442', 700: 'A93B39', 800: '6E2F2E', 900: '6E2F2E', 950: '4A2221' };
const AMBER = { 50: 'FDF3E0', 100: 'FDF3E0', 200: 'F2E3C6', 300: 'E5CEA1', 400: 'DFC08B', 500: 'D3AF62', 600: 'C9A13B', 700: '7A5F21', 800: '6B5321', 900: '5A4718', 950: '3F3017' };

const COLOR_MAP = {
  slate: SAGE, gray: SAGE, zinc: SAGE, neutral: SAGE, stone: SAGE,
  blue: BRAND, indigo: BRAND,
  sky: GREEN, cyan: GREEN, teal: GREEN,
  green: GREEN, emerald: GREEN, lime: GREEN,
  yellow: GOLD, amber: AMBER, orange: AMBER,
  violet: GOLD, purple: GOLD, fuchsia: GOLD,
  red: BRICK, rose: BRICK, pink: BRICK,
};

const PREFIXES = ['bg', 'text', 'border', 'from', 'via', 'to', 'ring', 'divide', 'fill', 'stroke', 'decoration', 'caret', 'accent', 'outline', 'shadow', 'placeholder'];

// 遗留的蓝/紫/冷灰十六进制（主要用于 ECharts 系列色与装饰）统一归一到参考站色板
const HEX_MAP = {
  // 冷灰 -> 鼠尾草灰绿
  'F0F2FA': 'EFF5F1', 'EEF2F6': 'E9F1EB', 'F5F7FA': 'F3F8F4', 'FAF7F2': 'FBFDFB',
  'EBF3EE': 'E2F4E4', 'D0DDEB': 'C9DBCE',
  // 蓝系 -> 鼠尾草绿系
  'EFF6FF': 'EFF5F1', 'DBEAFE': 'E1F4E4', 'BFDBFE': 'C7DED0', '93C5FD': 'AECBB8',
  '60A5FA': '7FA48C', '3B82F6': '5C8A6B', '2563EB': '326445', '1D4ED8': '2A5440',
  '1E40AF': '2A5440', '1E3A8A': '24483A', '0284C7': '2F7A50', '38BDF8': '6FBF92',
  '2C4875': '24483A',
  // 靛蓝/紫/品红 -> 砂金系
  'EEF2FF': 'FDF3E0', 'E0E7FF': 'FDF3E0', 'C7D2FE': 'EED9AE', 'A5B4FC': 'E5CEA1',
  '818CF8': 'DFC08B', '6366F1': 'C9A13B', '4F46E5': 'B8934A', '4338CA': '7A5F21',
  '1E1B4B': '3F3017', '581C87': '6B5321', '7C3AED': 'B8934A', 'A855F7': 'C9A13B',
  'C084FC': 'DFC08B', 'D8B4FE': 'E5CEA1', 'F4EFFB': 'FDF3E0', 'E4D8F7': 'EED9AE',
  'D9DCF2': 'C9DBCE',
  // 青/天蓝杂色 -> 薄荷绿
  '06B6D4': '34856B', '22D3EE': '6FBF92', '67E8F9': 'A7D9BC',
  // 正红/玫红 -> 砖红
  'FEF2F2': 'FBEAE9', 'FECACA': 'F2D5D4', 'F87171': 'D0827F', 'EF4444': 'C04442',
  'DC2626': 'A93B39', 'B91C1C': '6E2F2E',
};

const RGBA_MAP = [
  [/rgba\(37,\s*99,\s*235/g, 'rgba(50, 100, 69'],
  [/rgba\(59,\s*130,\s*246/g, 'rgba(92, 138, 107'],
  [/rgba\(99,\s*102,\s*241/g, 'rgba(201, 161, 59'],
  [/rgba\(139,\s*92,\s*246/g, 'rgba(184, 147, 74'],
  [/rgba\(244,\s*63,\s*94/g, 'rgba(192, 68, 66'],
  [/rgba\(148,\s*163,\s*184/g, 'rgba(138, 154, 143'],
  // 冷灰 slate 系 -> 鼠尾草灰绿
  [/rgba\(15,\s*23,\s*42/g, 'rgba(31, 51, 38'],
  [/rgba\(100,\s*116,\s*139/g, 'rgba(88, 104, 93'],
  [/rgba\(226,\s*232,\s*240/g, 'rgba(217, 229, 219'],
  // 翠绿 / 青绿 -> 薄荷墨绿
  [/rgba\(16,\s*185,\s*129/g, 'rgba(62, 155, 104'],
  [/rgba\(52,\s*211,\s*153/g, 'rgba(111, 191, 146'],
  [/rgba\(13,\s*148,\s*136/g, 'rgba(47, 122, 80'],
  // 琥珀 / 正红 -> 砂金 / 砖红
  [/rgba\(245,\s*158,\s*11/g, 'rgba(211, 175, 98'],
  [/rgba\(239,\s*68,\s*68/g, 'rgba(192, 68, 66'],
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
let hits = 0;

for (const file of targets) {
  const original = fs.readFileSync(file, 'utf8');
  let t = original;

  // 1) Tailwind 调色板类 -> 参考站十六进制任意值
  t = t.replace(
    new RegExp(`\\b(${PREFIXES.join('|')})-(${Object.keys(COLOR_MAP).join('|')})-(\\d{2,3})\\b`, 'g'),
    (match, prefix, color, shade) => {
      const mapped = COLOR_MAP[color]?.[shade];
      if (!mapped) return match;
      hits++;
      return `${prefix}-[#${mapped}]`;
    }
  );

  // 2) 遗留蓝/紫十六进制归一
  t = t.replace(/#[0-9a-fA-F]{6}\b/g, (hex) => {
    const rep = HEX_MAP[hex.slice(1).toUpperCase()];
    if (rep) hits++;
    return rep ? '#' + rep : hex;
  });

  for (const [re, to] of RGBA_MAP) {
    const before = t;
    t = t.replace(re, to);
    if (t !== before) hits++;
  }

  if (t !== original) {
    fs.writeFileSync(file, t);
    changed++;
    console.log('updated:', file);
  }
}
console.log('total files changed:', changed, '| replacements:', hits);
