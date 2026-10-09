// Shared helpers for every scene. Everything is a pure function of time, so any frame can be
// rendered on its own, in any order, and comes out identical every time.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
/** 0 before a, 1 after b, smooth in between. */
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const ease = {
  linear: k => k,
  inOut: k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  out: k => 1 - Math.pow(1 - k, 3),
  outExpo: k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  in: k => k * k * k,
  // A spring that settles without bouncing much (for things arriving with momentum).
  spring: k => (k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(6.5 * k)),
};
/** Seeded random numbers (mulberry32): same seed, same sequence, every render. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** Brand colours (same as the website). */
export const C = {
  bg: '#0d0805', amber: '#f2a33a', amberHot: '#ffd79a', teal: '#3fbfb0', tealHot: '#b8f2e9', blue: '#6f9cf5', blueHot: '#cfe0ff',
  cream: '#f3ece3', text2: '#d8cbbd', muted: '#b3a291', role: '#f2a33a', task: '#3fb3a7', context: '#e0705f', format: '#7fa6ea',
};
