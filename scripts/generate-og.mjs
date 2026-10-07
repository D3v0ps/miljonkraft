/**
 * Skapar delningsbilden public/og.png (1200 × 630) genom att rendera
 * scripts/og-template.html i Chromium med webbplatsens riktiga typsnitt.
 * Kör: node scripts/generate-og.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('scripts/og-template.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png', type: 'png' });
await browser.close();
console.log('public/og.png skapad (1200 × 630)');
