// Scroll reveals. Content is visible by default; only when motion is allowed does the
// .motion class hide [data-reveal] items until they come into view. Children of
// [data-reveal-stagger] get --i (0-5, repeating) so CSS delays each one a little more without long lists lagging.
import { motion } from './kernel';

export function bootReveal(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach(g =>
    [...g.children].forEach((c, i) => { (c as HTMLElement).style.setProperty('--i', String(i % 6)); c.setAttribute('data-reveal', ''); }));
  const items = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (!motion.allowed || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach(i => {
    // Anything already on screen at load shows at once (no flash of hidden content above the fold).
    const r = i.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) i.classList.add('is-in'); else io.observe(i);
  });
}

/** Count numbers up from 0 when they appear: <span data-count="19">19</span>. */
export function bootCounters(root: ParentNode = document) {
  const els = [...root.querySelectorAll<HTMLElement>('[data-count]')];
  if (!motion.allowed) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target as HTMLElement, end = +el.dataset.count!, t0 = performance.now(), dur = 1100;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / dur); el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  els.forEach(el => io.observe(el));
}
