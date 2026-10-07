/**
 * Webbläsarverifiering av den byggda sidan med Playwright (Chromium).
 *
 * Kör:  npm run build && npm run preview  (i ett annat fönster)
 *       node scripts/verify.mjs http://127.0.0.1:4321/
 *
 * Skriver skärmbilder till docs/screenshots/ och en rapport till docs/verification/report.json.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const baseUrl = process.argv[2] || 'http://127.0.0.1:4321/';
const outDir = 'docs/screenshots';
const widths = [
  { w: 320, h: 568, name: '320' },
  { w: 390, h: 844, name: '390' },
  { w: 768, h: 1024, name: '768' },
  { w: 1440, h: 900, name: '1440' },
];
const report = { baseUrl, checkedAt: new Date().toISOString(), viewports: {}, keyboard: {}, noJs: {}, reducedMotion: {}, links: {}, axe: {} };

await mkdir(outDir, { recursive: true });
await mkdir('docs/verification', { recursive: true });
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const browser = await chromium.launch();

async function overflowInfo(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        offenders.push({ tag: el.tagName.toLowerCase(), cls: el.className?.toString().slice(0, 60), right: Math.round(r.right), left: Math.round(r.left) });
        if (offenders.length > 12) break;
      }
    }
    return { viewportWidth: vw, scrollWidth: sw, horizontalOverflow: sw > vw, offenders };
  });
}

for (const v of widths) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2, locale: 'sv-SE' });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  const failed = [];
  page.on('requestfailed', (r) => failed.push(r.url()));
  const responses404 = [];
  page.on('response', (r) => { if (r.status() >= 400) responses404.push(`${r.status()} ${r.url()}`); });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${outDir}/${v.name}-first.png` });
  await page.screenshot({ path: `${outDir}/${v.name}-full.png`, fullPage: true });
  const overflow = await overflowInfo(page);
  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const body = getComputedStyle(document.body);
    const cta = document.querySelector('[data-cta="primary"]');
    const ctaRect = cta?.getBoundingClientRect();
    return {
      h1Lines: h1 ? Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)) : null,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      bodyFontSize: body.fontSize,
      ctaVisibleInFirstScreen: ctaRect ? ctaRect.top >= 0 && ctaRect.bottom <= window.innerHeight : null,
      ctaHeight: ctaRect ? Math.round(ctaRect.height) : null,
      pageHeight: document.documentElement.scrollHeight,
      navHeight: Math.round(document.querySelector('header')?.getBoundingClientRect().height || 0),
    };
  });
  // axe
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return { violations: r.violations.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.slice(0, 5).map((n) => n.target.join(' ')) })), passes: r.passes.length, incomplete: r.incomplete.map((x) => x.id) };
  });
  report.viewports[v.name] = { overflow, metrics, consoleErrors, failedRequests: failed, responses4xx5xx: responses404 };
  report.axe[v.name] = axe;
  await ctx.close();
}

// Zoom 200 % på en 1440-skärm motsvarar ungefär 720 px CSS-bredd.
{
  const ctx = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${outDir}/zoom200-first.png` });
  report.viewports['zoom200'] = { overflow: await overflowInfo(page) };
  await ctx.close();
}

// Tangentbord på mobil och desktop.
for (const v of [widths[1], widths[3]]) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
  const page = await ctx.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const focusTrail = [];
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const hidden = r.width === 0 || r.height === 0;
      const hasRing = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
      return { tag: el.tagName.toLowerCase(), text: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40), href: el.getAttribute('href'), hasRing, hidden, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
    });
    if (info) focusTrail.push(info);
  }
  // Menyknapp med tangentbord (bara mobil).
  let menu = null;
  if (v.w < 900) {
    const btn = page.locator('[data-menu-toggle]');
    if (await btn.count()) {
      await btn.focus();
      await page.keyboard.press('Enter');
      const expanded = await btn.getAttribute('aria-expanded');
      await page.keyboard.press('Tab');
      const firstItem = await page.evaluate(() => document.activeElement?.textContent?.trim());
      await page.keyboard.press('Escape');
      const afterEsc = await btn.getAttribute('aria-expanded');
      const focusBack = await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle'));
      menu = { expandedAfterEnter: expanded, firstItemAfterTab: firstItem, expandedAfterEscape: afterEsc, focusReturnedToButton: focusBack };
    }
  }
  report.keyboard[v.name] = { focusTrail, menu, missingRing: focusTrail.filter((f) => !f.hasRing).length, tinyTargets: focusTrail.filter((f) => !f.hidden && (f.w < 24 || f.h < 24)).length };
  await ctx.close();
}

// Utan JavaScript.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    primaryCtaHref: document.querySelector('[data-cta="primary"]')?.getAttribute('href')?.slice(0, 60),
    modelSteps: document.querySelectorAll('#miljonmodellen ol li').length,
    telLinks: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
    mailLinks: [...document.querySelectorAll('a[href^="mailto:"]')].length,
    navLinksVisible: [...document.querySelectorAll('header nav a')].filter((a) => a.getBoundingClientRect().height > 0).length,
    statusVisible: !!document.querySelector('[data-status]') && document.querySelector('[data-status]').getBoundingClientRect().height > 0,
  }));
  await page.screenshot({ path: `${outDir}/390-nojs-full.png`, fullPage: true });
  report.noJs = r;
  await ctx.close();
}

// Reducerad rörelse.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${outDir}/390-reduced-motion-first.png` });
  const animated = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => { const cs = getComputedStyle(el); return cs.animationName !== 'none' && cs.animationDuration !== '0s'; }).length);
  report.reducedMotion = { elementsStillAnimating: animated };
  await ctx.close();
}

// Länkar.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const links = await page.evaluate(() => {
    const out = { anchorsMissing: [], externalWithoutNoopener: [], tel: [], mailto: [], external: [] };
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) { if (href !== '#' && !document.querySelector(href)) out.anchorsMissing.push(href); }
      else if (href.startsWith('tel:')) out.tel.push(href);
      else if (href.startsWith('mailto:')) out.mailto.push(href.slice(0, 80));
      else if (/^https?:/.test(href)) { out.external.push(href); if (a.target === '_blank' && !/noopener/.test(a.rel)) out.externalWithoutNoopener.push(href); }
    }
    return out;
  });
  const titleMeta = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name=description]')?.content,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    robots: document.querySelector('meta[name=robots]')?.content,
    lang: document.documentElement.lang,
    h1Count: document.querySelectorAll('h1').length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName.toLowerCase()} ${h.textContent.trim().slice(0, 50)}`),
    jsonLd: !!document.querySelector('script[type="application/ld+json"]'),
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
  }));
  report.links = links;
  report.meta = titleMeta;
  await ctx.close();
}

await browser.close();
await writeFile('docs/verification/report.json', JSON.stringify(report, null, 2));

const problems = [];
for (const [k, v] of Object.entries(report.viewports)) if (v.overflow.horizontalOverflow) problems.push(`Horisontell överrinning vid ${k}`);
for (const [k, v] of Object.entries(report.axe)) for (const x of v.violations) problems.push(`axe ${k}: ${x.id} (${x.impact}) ${x.nodes[0]}`);
for (const [k, v] of Object.entries(report.keyboard)) if (v.missingRing) problems.push(`${v.missingRing} fokuserade element utan synlig fokusring vid ${k}`);
if (report.links.anchorsMissing.length) problems.push(`Ankare saknas: ${report.links.anchorsMissing.join(', ')}`);
if (report.links.externalWithoutNoopener.length) problems.push(`Externa länkar utan noopener: ${report.links.externalWithoutNoopener.join(', ')}`);
if (report.noJs.modelSteps !== 8) problems.push(`Utan JS syns ${report.noJs.modelSteps} modellsteg, förväntat 8`);
console.log(JSON.stringify({ meta: report.meta, noJs: report.noJs, reducedMotion: report.reducedMotion, viewports: Object.fromEntries(Object.entries(report.viewports).map(([k, v]) => [k, { overflow: v.overflow.horizontalOverflow, offenders: v.overflow.offenders.slice(0, 3), metrics: v.metrics, consoleErrors: v.consoleErrors, failed: v.failedRequests, http4xx: v.responses4xx5xx }])), keyboard: Object.fromEntries(Object.entries(report.keyboard).map(([k, v]) => [k, { menu: v.menu, missingRing: v.missingRing, tinyTargets: v.tinyTargets, trail: v.focusTrail.map((f) => `${f.tag}:${f.text || f.href}`).slice(0, 30) }])), problems }, null, 2));
process.exitCode = problems.length ? 1 : 0;
