// Gesture-driven springs, in Apple's terms: damping ratio (1 = no bounce) and response
// (seconds; lower is snappier). A spring always starts from the current value and the
// current velocity, so it can be grabbed and redirected at any moment without a jump.
import { onTick } from './kernel';

export interface SpringOpts { damping?: number; response?: number; velocity?: number; onUpdate: (x: number) => void; onDone?: () => void }

/** Animate from `from` to `to`. Returns stop(), which also reports the live value and velocity. */
export function springTo(from: number, to: number, o: SpringOpts) {
  const z = o.damping ?? 1, w = (2 * Math.PI) / (o.response ?? 0.4);
  const k = w * w, c = 2 * z * w; // unit mass
  let x = from, v = o.velocity ?? 0;
  const stop = onTick((_t, dt) => {
    // A few small steps per frame keep fast springs stable.
    for (let i = 0; i < 4; i++) { const h = dt / 4; const a = -k * (x - to) - c * v; v += a * h; x += v * h; }
    if (Math.abs(x - to) < 0.3 && Math.abs(v) < 5) { x = to; v = 0; o.onUpdate(x); stop(); o.onDone?.(); return; }
    o.onUpdate(x);
  });
  return { stop: () => { stop(); return { x, v }; } };
}

/** Where a flick will come to rest (Apple's projection, the same deceleration as scrolling). */
export function project(velocity: number, rate = 0.998) {
  return ((velocity / 1000) * rate) / (1 - rate);
}

/** Resistance past an edge: the further you pull, the less it follows. */
export function rubberband(over: number, size: number, c = 0.55) {
  return (over * size * c) / (size + c * Math.abs(over));
}

/** Release velocity (px/s) from the last ~100 ms of pointer samples. */
export function velocityOf(samples: { y: number; t: number }[]) {
  const last = samples[samples.length - 1];
  const first = samples.find(s => last.t - s.t <= 100) || samples[0];
  const dt = (last.t - first.t) / 1000;
  return dt > 0 ? (last.y - first.y) / dt : 0;
}
