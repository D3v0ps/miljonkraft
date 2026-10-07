/**
 * Sidans skript. Allt innehåll finns i HTML och är läsbart utan skript.
 * Tråden ritas i CSS med sidans egen skroll. Här finns bara reserven för webbläsare
 * utan scroll-driven animations, filmens dialog och markeringen att skriptet körts.
 */
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollDriven = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

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
