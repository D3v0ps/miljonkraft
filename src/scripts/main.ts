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
// Streckningen räknas då i skärmpixlar, så varje banas längd mäts här och sätts som --len.
// Utan mätt längd står tråden färdigritad (se global.css, avsnittet Rörelse).
function measure(svg: SVGSVGElement) {
  const vb = svg.viewBox.baseVal;
  const sx = svg.clientWidth / vb.width;
  const sy = svg.clientHeight / vb.height;
  if (!sx || !sy) return; // Varianten för den andra brytpunkten är dold.
  svg.querySelectorAll('path').forEach((p) => {
    const total = p.getTotalLength();
    const n = Math.min(400, Math.max(24, Math.round(total / 6)));
    let len = 0;
    let prev = p.getPointAtLength(0);
    for (let i = 1; i <= n; i++) {
      const q = p.getPointAtLength((total * i) / n);
      len += Math.hypot((q.x - prev.x) * sx, (q.y - prev.y) * sy);
      prev = q;
    }
    p.style.setProperty('--len', `${Math.ceil(len) + 2}px`);
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
