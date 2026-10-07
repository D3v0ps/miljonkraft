/**
 * Renders scripts/film/film.html to a JPEG frame sequence with Chromium (Playwright).
 * The page is a pure function of time (window.renderFrame(t)), so the output is deterministic.
 *
 *   node scripts/film/render.mjs --format=landscape --out=<dir>            all frames, 30 fps
 *   node scripts/film/render.mjs --format=vertical  --out=<dir>
 *   node scripts/film/render.mjs --format=landscape --times=8.5,12.2 --out=<dir>   single stills
 *   node scripts/film/render.mjs --format=landscape --poster=12.9 --out=<dir>     poster-landscape.png
 *   node scripts/film/render.mjs --text=public/film                       writes the text alternative
 *                                                                          (miljonkraft-film-text.json, -kapitel.vtt)
 * Options: --workers=4 --quality=92 --from=0 --to=56 (seconds)
 */
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
}));
const format = args.format === 'vertical' ? 'vertical' : 'landscape';
const size = format === 'vertical' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
const url = pathToFileURL(join(here, 'film.html')).href + `?format=${format}`;
const quality = Number(args.quality ?? 92);
const workers = Math.max(1, Number(args.workers ?? 4));

async function openPage(browser) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => window.filmReady);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

const vtTime = s => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60, r = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(r).padStart(3, '0')}`;
};

const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
try {
  if (args.text) {
    const page = await openPage(browser);
    const data = await page.evaluate(() => window.filmText());
    const film = await page.evaluate(() => window.FILM);
    const outDir = resolve(args.text);
    mkdirSync(outDir, { recursive: true });
    const json = {
      title: 'Miljonkraft Botkyrka, film',
      language: 'sv-SE',
      duration: film.duration,
      description: 'Textalternativ till filmen. All text som visas i bild, scen för scen, med start och slut i sekunder. Filmen har ingen speakerröst, bara musik.',
      music: 'Originalmusik skapad med kod (scripts/film/music.py), 120 BPM, D-dur.',
      scenes: data.scenes.map(s => ({
        id: s.id, chapter: s.chapter, start: s.start, end: s.end, visual: s.visual,
        text: s.text.map(x => ({ text: x.text, start: Math.round(x.start * 100) / 100, end: Math.round(x.end * 100) / 100 })),
      })),
    };
    writeFileSync(join(outDir, 'miljonkraft-film-text.json'), JSON.stringify(json, null, 2) + '\n');
    let vtt = 'WEBVTT\nKind: chapters\nLanguage: sv\n\n';
    data.scenes.forEach((s, i) => { vtt += `${i + 1}\n${vtTime(s.start)} --> ${vtTime(s.end)}\n${s.chapter}\n\n`; });
    writeFileSync(join(outDir, 'miljonkraft-film-kapitel.vtt'), vtt);
    console.log(`text alternative written to ${outDir}`);
  } else {
    const fps = 30;
    const duration = 56.0;
    const outDir = resolve(args.out ?? join(here, '.work', `frames-${format}`));
    mkdirSync(outDir, { recursive: true });
    let jobs;
    if (args.poster) {
      jobs = [{ t: Number(args.poster), file: join(outDir, `poster-${format}.png`) }];
    } else if (args.times) {
      jobs = args.times.split(',').map(Number).map(t => ({ t, file: join(outDir, `still-${format}-${t.toFixed(2)}.jpg`) }));
    } else {
      const from = Math.round(Number(args.from ?? 0) * fps);
      const to = Math.round(Number(args.to ?? duration) * fps);
      jobs = [];
      for (let i = from; i < to; i++) jobs.push({ t: i / fps, file: join(outDir, `f${String(i).padStart(5, '0')}.jpg`) });
    }
    const n = Math.min(workers, jobs.length);
    const t0 = Date.now();
    let done = 0;
    await Promise.all(Array.from({ length: n }, async (_, w) => {
      const page = await openPage(browser);
      for (let k = w; k < jobs.length; k += n) {
        const { t, file } = jobs[k];
        await page.evaluate(tt => window.renderFrame(tt), t);
        const png = file.endsWith('.png');
        await page.screenshot({ path: file, type: png ? 'png' : 'jpeg', ...(png ? {} : { quality }), clip: { x: 0, y: 0, ...size } });
        done++;
        if (done % 150 === 0) console.log(`${format}: ${done}/${jobs.length} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
      await page.close();
    }));
    console.log(`${format}: ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${outDir}`);
  }
} finally {
  await browser.close();
}
