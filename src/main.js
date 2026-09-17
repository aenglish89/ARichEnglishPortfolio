// Self-hosted fonts (latin subset, only the weights in use), font-display: swap.
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import './style.css';
import { BOOKING_URL } from './config.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------
   CTAs — the HTML is already stamped with BOOKING_URL at build time.
   This pass guarantees every booking link opens the same URL in a new
   tab with rel="noopener", even if a link is added later without it.
   ------------------------------------------------------------------ */
document.querySelectorAll('a[data-booking]').forEach((a) => {
  a.href = BOOKING_URL;
  a.target = '_blank';
  a.rel = 'noopener';
});

/* ------------------------------------------------------------------
   Intro overlay (home page only). The <head> script decides whether
   it runs; here we only handle removal and the keyboard skip.
   ------------------------------------------------------------------ */
const intro = document.getElementById('intro');
if (intro && document.documentElement.classList.contains('has-intro')) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    intro.remove();
    document.body.classList.remove('is-locked');
    document.documentElement.classList.remove('has-intro');
  };
  intro.addEventListener('animationend', (e) => {
    if (e.target === intro) finish();
  });
  intro.querySelector('.intro__skip')?.addEventListener('click', finish);
  // Never block the page for more than 2.5 s, whatever the animation does.
  window.setTimeout(finish, 2500);
} else if (intro) {
  intro.remove();
}

/* ------------------------------------------------------------------
   Nav: transparent over the hero, solid after 80 px of scroll.
   ------------------------------------------------------------------ */
const nav = document.querySelector('.nav');
if (nav && !nav.classList.contains('nav--solid')) {
  let ticking = false;
  const update = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 80);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ------------------------------------------------------------------
   Scroll reveal: 12 px rise + fade, 500 ms, once. Skipped for
   reduced motion (CSS also neutralises it).
   ------------------------------------------------------------------ */
const revealTargets = document.querySelectorAll('.reveal');
if (revealTargets.length && !reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

/* ------------------------------------------------------------------
   Charging page: give the footer room above the fixed bottom bar.
   ------------------------------------------------------------------ */
if (document.querySelector('.bar')) {
  document.body.classList.add('has-bar');
}
