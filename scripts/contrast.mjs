/**
 * Beräknar WCAG-kontrast för färgparen i src/styles/global.css (tokens) och skriver en tabell.
 * Kör: node scripts/contrast.mjs
 */
import { readFile } from 'node:fs/promises';

const css = await readFile('src/styles/global.css', 'utf8');
const tokens = {};
for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens[m[1]] ??= m[2];

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };

// Par som faktiskt används på sidan: [förgrund, bakgrund, krav]
const pairs = JSON.parse(await readFile('scripts/contrast-pairs.json', 'utf8'));
let fail = 0;
console.log('Förgrund'.padEnd(26) + 'Bakgrund'.padEnd(26) + 'Krav   Kontrast');
for (const [fg, bg, need, note] of pairs) {
  const a = tokens[fg] ?? fg, b = tokens[bg] ?? bg;
  const r = ratio(a, b);
  const ok = r >= need;
  if (!ok) fail++;
  console.log(`${(fg + ' ' + a).padEnd(26)}${(bg + ' ' + b).padEnd(26)}${String(need).padEnd(7)}${r.toFixed(2)} ${ok ? 'OK' : 'FAIL'} ${note || ''}`);
}
process.exitCode = fail ? 1 : 0;
