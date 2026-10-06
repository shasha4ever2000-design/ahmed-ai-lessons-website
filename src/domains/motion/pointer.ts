// Pointer effects (mouse and trackpad only, motion allowed):
// - cards tilt a few degrees and catch a sheen of light where the cursor is
// - a soft "lantern" glow follows the cursor across the page
import { motion, onTick, spring } from './kernel';

export function bootTilt(selector = '[data-tilt]') {
  if (!motion.allowed || !motion.finePointer) return;
  document.querySelectorAll<HTMLElement>(selector).forEach(el => {
    let rx = { x: 0, v: 0 }, ry = { x: 0, v: 0 }, tx = 0, ty = 0, stop: (() => void) | null = null, idle = 0;
    const run = () => { if (!stop) stop = onTick((_, dt) => {
      rx = spring(rx.x, rx.v, tx, dt); ry = spring(ry.x, ry.v, ty, dt);
      el.style.setProperty('--rx', rx.x.toFixed(2) + 'deg'); el.style.setProperty('--ry', ry.x.toFixed(2) + 'deg');
      if (Math.abs(rx.x - tx) + Math.abs(ry.x - ty) + Math.abs(rx.v) + Math.abs(ry.v) < 0.01 && ++idle > 10) { stop!(); stop = null; idle = 0; }
    }); };
    el.addEventListener('pointermove', e => {
      const b = el.getBoundingClientRect(); const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      tx = (0.5 - py) * 6; ty = (px - 0.5) * 6; el.classList.add('is-lit'); run();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; el.classList.remove('is-lit'); run(); });
  });
}

export function bootLantern() {
  if (!motion.allowed || !motion.finePointer) return;
  const glow = document.createElement('div');
  glow.className = 'lantern'; glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);
  let x = innerWidth / 2, y = innerHeight / 3, stop: (() => void) | null = null;
  // Runs only while the light is catching up with the cursor, then stops until the next move.
  addEventListener('pointermove', () => {
    if (stop) return;
    stop = onTick(() => {
      const p = motion.pointer;
      x += (p.x - x) * 0.14; y += (p.y - y) * 0.14;
      glow.style.transform = `translate3d(${(x - 300).toFixed(1)}px, ${(y - 300).toFixed(1)}px, 0)`;
      if (Math.abs(p.x - x) + Math.abs(p.y - y) < 0.5) { stop!(); stop = null; }
    });
  }, { passive: true });
}
