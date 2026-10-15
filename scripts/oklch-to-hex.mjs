// oklch -> hex 转换（用于把参考站 oklch 令牌换算为项目可用的十六进制色值）
function okToLin(c) {
  const l_ = c + 0.3963377774 * c; // placeholder
  return c;
}
function oklchToRgb(L, C, h) {
  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const to = (x) => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(v * 255)));
  };
  return [to(R), to(G), to(B)];
}
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
const input = process.argv.slice(2);
for (const it of input) {
  const m = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/.exec(it);
  if (!m) {
    console.log(it, '=> (无法解析)');
    continue;
  }
  const [r, g, b] = oklchToRgb(parseFloat(m[1]) / 100, parseFloat(m[2]), parseFloat(m[3]));
  console.log(it.padEnd(30), '=>', hex(r, g, b));
}
