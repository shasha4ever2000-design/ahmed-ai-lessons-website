// Motion context: one kernel for every animation on the page.
// - one requestAnimationFrame loop shared by all effects, paused when the tab is hidden
// - one policy for reduced motion (live: it reacts if the visitor changes the setting)
// - shared pointer and scroll state, so effects don't each add their own listeners

type Tick = (t: number, dt: number) => void;

const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
const fine = typeof matchMedia === 'function' ? matchMedia('(hover: hover) and (pointer: fine)') : null;

export const motion = {
  /** False when the visitor asked for less motion. Effects must check this. */
  get allowed() { return !(mq && mq.matches); },
  /** True on a mouse or trackpad; pointer effects only run there. */
  get finePointer() { return !!(fine && fine.matches); },
  pointer: { x: 0, y: 0, nx: 0.5, ny: 0.5, active: false },
  scroll: { y: 0, progress: 0 },
};

const ticks = new Set<Tick>();
let raf = 0, last = 0;
function loop(t: number) {
  const dt = Math.min((t - last) / 1000, 0.05); last = t;
  ticks.forEach(fn => fn(t, dt));
  raf = ticks.size ? requestAnimationFrame(loop) : 0;
}
/** Run fn every frame until the returned function is called. */
export function onTick(fn: Tick) {
  ticks.add(fn);
  if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); }
  return () => { ticks.delete(fn); };
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
  else if (ticks.size && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
});

let wired = false;
/** Start shared listeners once per page. */
export function bootKernel() {
  if (wired) return; wired = true;
  const root = document.documentElement;
  const setMotion = () => root.classList.toggle('motion', motion.allowed);
  setMotion(); mq?.addEventListener?.('change', setMotion);
  addEventListener('pointermove', e => {
    const p = motion.pointer; p.x = e.clientX; p.y = e.clientY; p.nx = e.clientX / innerWidth; p.ny = e.clientY / innerHeight; p.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => (motion.pointer.active = false));
  const onScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    motion.scroll.y = scrollY; motion.scroll.progress = Math.min(1, scrollY / max);
    root.style.setProperty('--scroll', motion.scroll.progress.toFixed(4));
  };
  onScroll(); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll, { passive: true });
}

/** Spring toward a target; returns the new value and velocity. Stiffness/damping tuned for UI. */
export function spring(x: number, v: number, target: number, dt: number, k = 170, c = 18) {
  const a = (target - x) * k - v * c; v += a * dt; return { x: x + v * dt, v };
}
