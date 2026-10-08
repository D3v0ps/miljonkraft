/**
 * Sidans skript. Allt innehåll finns i HTML och är läsbart utan skript.
 * Tråden ritas i CSS med sidans egen skroll. Här finns bara reserven för webbläsare
 * utan scroll-driven animations, filmens dialog och markeringen att skriptet körts.
 */
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollDriven = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

/* ---------- Trådens längd på skärmen ---------- */
// Banorna ritas med vector-effect: non-scaling-stroke i SVG:er som sträcks olika i bredd och höjd.
// Streckningen räknas då i skärmpixlar, så varje banas längd sätts här som --len.
// Banan skalas om till skärmens mått och mäts med ett enda getTotalLength-anrop, vilket är
// både exakt och billigt (punktvis sampling tog över en sekund på en långsam telefon).
// Utan mätt längd står tråden färdigritad (se global.css, avsnittet Rörelse).
const SVG_NS = 'http://www.w3.org/2000/svg';
let probe: SVGPathElement | null = null;
function probePath(): SVGPathElement {
  if (probe) return probe;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  probe = document.createElementNS(SVG_NS, 'path');
  svg.appendChild(probe);
  document.body.appendChild(svg);
  return probe;
}
// Banorna i src/lib/thread.ts använder bara absoluta M, L, C, Q och A (utan rotation),
// så en skalning av koordinaterna ger exakt samma form som på skärmen.
function scalePath(d: string, sx: number, sy: number): string {
  return d.replace(/([MLCQA])([^MLCQA]*)/g, (_, cmd: string, args: string) => {
    const n = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd === 'A') {
      const out: number[] = [];
      for (let i = 0; i + 6 < n.length; i += 7) out.push(n[i] * sx, n[i + 1] * sy, n[i + 2], n[i + 3], n[i + 4], n[i + 5] * sx, n[i + 6] * sy);
      return cmd + out.join(' ');
    }
    return cmd + n.map((v, i) => (i % 2 ? v * sy : v * sx)).join(' ');
  });
}
function measure(svg: SVGSVGElement) {
  const vb = svg.viewBox.baseVal;
  const sx = svg.clientWidth / vb.width;
  const sy = svg.clientHeight / vb.height;
  if (!sx || !sy) return; // Varianten för den andra brytpunkten är dold.
  const tool = probePath();
  svg.querySelectorAll('path').forEach((p) => {
    tool.setAttribute('d', scalePath(p.getAttribute('d') || '', sx, sy));
    p.style.setProperty('--len', `${Math.ceil(tool.getTotalLength()) + 2}px`);
  });
}
if (!reduce && 'ResizeObserver' in window) {
  // Mäts vid start och igen när ett block ändrar storlek (typsnittsbyte, textstorlek, ny bredd).
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      e.target.querySelectorAll<SVGSVGElement>('svg').forEach(measure);
      const t = e.target;
      requestAnimationFrame(() => t.classList.add('is-measured'));
    }
  });
  document.querySelectorAll('.t').forEach((t) => ro.observe(t));
}

/* ---------- Reserv: rita varje block när det når pennan på 65 % av fönstret ---------- */
if (!scrollDriven && !reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add(e.target.matches('[data-lit]') ? 'is-lit' : 'is-drawn');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -35% 0px' },
  );
  document.querySelectorAll('.seg, [data-lit]').forEach((el) => io.observe(el));
}

/* ---------- Filmen i dialog ---------- */
const dialog = document.querySelector<HTMLDialogElement>('[data-film]');
const video = dialog?.querySelector<HTMLVideoElement>('video');
const openers = document.querySelectorAll<HTMLAnchorElement>('[data-film-open]');
if (dialog && video && typeof dialog.showModal === 'function') {
  let opener: HTMLElement | null = null;
  const load = () => {
    if (video.dataset.loaded) return;
    // Stående telefoner får den stående filmen, smala skärmar den mindre filen.
    const portrait = window.matchMedia('(orientation: portrait) and (max-width: 700px)').matches;
    const vertical = portrait && video.dataset.srcVertical;
    const src = vertical || (window.innerWidth < 900 && video.dataset.srcSmall) || video.dataset.src || '';
    video.poster = (vertical && video.dataset.posterVertical) || video.dataset.poster || '';
    video.classList.toggle('is-vertical', Boolean(vertical));
    video.src = src;
    const track = video.querySelector<HTMLTrackElement>('track[data-src]');
    if (track?.dataset.src) track.src = track.dataset.src;
    video.dataset.loaded = '1';
  };
  openers.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      opener = a;
      load();
      dialog.showModal();
      video.play().catch(() => {});
    }),
  );
  dialog.querySelector('[data-film-close]')?.addEventListener('click', () => dialog.close());
  // Klick på bakgrunden stänger dialogen.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    video.pause();
    opener?.focus();
  });
}

/* ---------- Utskrift: allt färdigritat ---------- */
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('.seg').forEach((el) => el.classList.add('is-drawn'));
  document.querySelectorAll('[data-lit]').forEach((el) => el.classList.add('is-lit'));
});

root.classList.add('js-ready');
