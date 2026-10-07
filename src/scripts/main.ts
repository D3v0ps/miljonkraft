/**
 * Sidans rörelse. Allt innehåll finns i HTML och är läsbart utan skript.
 * Skriptet lägger bara till avtäckning vid skroll, skrollstyrda värden och stegens markering.
 */
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ---------- Avtäckning ---------- */
const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-wipe], [data-clock]');
if ('IntersectionObserver' in window && !reduce.matches) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-in'));
}

/* ---------- Skrollstyrda värden (--p från 0 till 1) ---------- */
type Mode = 'leave' | 'through' | 'enter';
const tracked = Array.from(document.querySelectorAll<HTMLElement>('[data-progress]')).map((el) => ({
  el,
  mode: (el.dataset.progress || 'through') as Mode,
  visible: true,
  last: -1,
}));

function measure() {
  const vh = window.innerHeight;
  for (const t of tracked) {
    if (!t.visible) continue;
    const r = t.el.getBoundingClientRect();
    let p: number;
    if (t.mode === 'leave') p = clamp(-r.top / Math.max(r.height, 1));
    else if (t.mode === 'enter') p = clamp((vh - r.top) / Math.max(Math.min(r.height, vh), 1));
    else p = clamp((vh - r.top) / (vh + r.height));
    const rounded = Math.round(p * 1000) / 1000;
    if (rounded !== t.last) {
      t.last = rounded;
      t.el.style.setProperty('--p', String(rounded));
    }
  }
}

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    measure();
    window.dispatchEvent(new CustomEvent('mk:scroll'));
  });
};

if (!reduce.matches) {
  if ('IntersectionObserver' in window) {
    const vis = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const t = tracked.find((x) => x.el === e.target);
        if (t) t.visible = e.isIntersecting;
      }
      measure();
    });
    tracked.forEach((t) => vis.observe(t.el));
  }
  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
} else {
  // Utan rörelse visas sidfotens stora ord fyllt och allt annat i viloläge.
  tracked.forEach((t) => t.mode === 'enter' && t.el.style.setProperty('--p', '1'));
}

/* ---------- Miljonmodellen tänds steg för steg ---------- */
const stepsList = document.querySelector<HTMLElement>('[data-steps]');
if (stepsList && 'IntersectionObserver' in window && !reduce.matches) {
  const steps = Array.from(stepsList.querySelectorAll<HTMLElement>('.step'));
  stepsList.classList.add('is-scrolly');
  let active = -1;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    steps.forEach((s, n) => {
      s.classList.toggle('is-active', n === i);
      s.classList.toggle('is-done', n < i);
    });
  };
  const pick = () => {
    const line = window.innerHeight * 0.62;
    let idx = -1;
    steps.forEach((s, n) => {
      if (s.getBoundingClientRect().top < line) idx = n;
    });
    setActive(idx);
  };
  let inView = false;
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    pick();
  }).observe(stepsList);
  window.addEventListener('mk:scroll', () => inView && pick());
  pick();
}

/* ---------- Himlen i hero (WebGL) laddas när sidan är klar ---------- */
const canvas = document.querySelector<HTMLCanvasElement>('[data-sky]');
if (canvas) {
  const load = () => import('./sky').then((m) => m.startSky(canvas, reduce.matches)).catch(() => {});
  if ('requestIdleCallback' in window) (window as Window).requestIdleCallback(load, { timeout: 1200 });
  else setTimeout(load, 300);
}

root.classList.add('js-ready');
