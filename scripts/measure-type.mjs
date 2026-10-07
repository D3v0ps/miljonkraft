/**
 * Mäter affischrubrikernas bredd i Montserrat så att varje rad fyller sin behållare exakt.
 * Resultatet skrivs till src/lib/type-fit.json och används som --k (bredd i em) i CSS:
 *   font-size: calc(100cqw / var(--k))
 * Kör efter textändringar i hero eller affischrader: node scripts/measure-type.mjs
 */
import { chromium } from 'playwright';
import { writeFile, mkdtemp, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// [nyckel, text, vikt, letter-spacing i em]
const items = [
  ['hero-1', 'FLER I ARBETE.', 800, -0.04],
  ['hero-2', 'STARKARE FÖRETAG.', 200, -0.03],
  ['hero-3', 'ETT STARKARE BOTKYRKA.', 800, -0.04],
  ['hero-1a', 'FLER I', 800, -0.04],
  ['hero-1b', 'ARBETE.', 800, -0.04],
  ['hero-2a', 'STARKARE', 200, -0.03],
  ['hero-2b', 'FÖRETAG.', 200, -0.03],
  ['hero-3a', 'ETT STARKARE', 800, -0.04],
  ['hero-3b', 'BOTKYRKA.', 800, -0.04],
  ['vision-1', 'SVERIGES LÄGSTA', 200, -0.03],
  ['vision-2', 'ARBETSLÖSHET', 800, -0.04],
  ['footer', 'MILJONKRAFT', 800, -0.04],
  ['manifest', 'SAMHÄLLSKRAFT', 800, -0.04],
  ['ticker', 'NÅ FÖRSTÅ RIKTA BEVISA UTVECKLA ÖVERGÅ BÄRA VÄXA', 800, -0.02],
];

const dir = await mkdtemp(join(tmpdir(), 'mk-type-'));
await copyFile('public/fonts/montserrat-latin-wght-normal.woff2', join(dir, 'm.woff2'));
await writeFile(join(dir, 'm.html'), `<!doctype html><meta charset="utf-8"><style>@font-face{font-family:"M";src:url("m.woff2") format("woff2");font-weight:100 900}</style><p style="font-family:M">Å</p>`);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + join(dir, 'm.html'));
await page.evaluate(() => Promise.all([100, 200, 800].map((w) => document.fonts.load(`${w} 100px M`))));
const out = {};
for (const [key, text, weight, ls] of items) {
  const em = await page.evaluate(({ text, weight, ls }) => {
    const span = document.createElement('span');
    span.style.cssText = `font-family:M;font-weight:${weight};font-size:100px;letter-spacing:${ls}em;white-space:nowrap;position:absolute;`;
    span.textContent = text;
    document.body.appendChild(span);
    const w = span.getBoundingClientRect().width;
    span.remove();
    // Sista tecknets spärrning hör inte till den synliga bredden.
    return (w - ls * 100) / 100;
  }, { text, weight, ls });
  out[key] = Math.round(em * 1000) / 1000;
}
await browser.close();
await writeFile('src/lib/type-fit.json', JSON.stringify(out, null, 2) + '\n');
console.log(out);
