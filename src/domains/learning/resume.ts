// Where the visitor stopped reading: the last lesson they opened and how far down they got.
// One record for the whole site (a lesson's slug is the same in both languages).
import { KEYS, read, write } from './storage';
import { isDone } from './progress';

export interface Place { slug: string; pct: number; at: number }

export function lastPlace(): Place | null {
  const p = read<Place | null>(KEYS.last, null);
  return p && typeof p.slug === 'string' && typeof p.pct === 'number' ? p : null;
}

export function savePlace(slug: string, pct: number) {
  write(KEYS.last, { slug, pct: Math.round(Math.max(0, Math.min(1, pct)) * 100) / 100, at: Date.now() });
}

/** A lesson worth offering to continue: started, not finished, not marked done. */
export function toContinue(): Place | null {
  const p = lastPlace();
  return p && p.pct < 0.95 && !isDone(p.slug) ? p : null;
}

/** How far through an element the reader is, 0 to 1 (0 at its top, 1 when its end reaches the bottom of the screen). */
export function readFraction(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
}

/** The page scroll position that matches a reading fraction for an element. */
export function scrollForFraction(el: HTMLElement, f: number) {
  const r = el.getBoundingClientRect();
  return r.top + scrollY + f * Math.max(1, r.height - innerHeight);
}
