// Learning context: what this visitor has finished. One aggregate, used by the homepage,
// lesson pages, lesson lists and cards (previously four copies of the same logic).
import { KEYS, read, write } from './storage';
import { emit } from '../shared/events';

/** Start Here, in order. Step 1 is the prompt builder; the rest are lesson slugs. */
export const START_SLUGS = ['', 'prompt-patterns', 'set-up-chatgpt-for-work', 'claude-projects', 'summarize-documents-and-meetings', 'first-ai-automation'];
export const TOTAL_LESSONS = 19;

export function doneLessons(): string[] {
  const d = read<unknown>(KEYS.done, []);
  return Array.isArray(d) ? d.filter((x): x is string => typeof x === 'string') : [];
}
export function step1Done(): boolean {
  const c = read<Record<string, unknown>>(KEYS.cert, {});
  return !!(c && c.step1);
}
export const isDone = (slug: string) => doneLessons().includes(slug);

function changed() { emit('learning:progress-changed', { done: doneLessons(), step1: step1Done() }); }

/** Toggle a lesson; returns the new state. */
export function toggleLesson(slug: string): boolean {
  const d = doneLessons();
  const now = !d.includes(slug);
  write(KEYS.done, now ? [...d, slug] : d.filter(s => s !== slug));
  if (now) emit('learning:lesson-completed', { slug, total: doneLessons().length });
  changed();
  return now;
}

/** The prompt builder counts as Start Here step 1. Returns true the first time. */
export function completeStep1(): boolean {
  const c = read<Record<string, unknown>>(KEYS.cert, {}) || {};
  if (c.step1) return false;
  write(KEYS.cert, { ...c, step1: true });
  emit('learning:step-completed', { step: 1 });
  changed();
  return true;
}

/** Start Here status: which steps are done, how many, and which one is next (-1 when none or all). */
export function startHere() {
  const d = doneLessons();
  const done = START_SLUGS.map((s, i) => (i === 0 ? step1Done() : d.includes(s)));
  const n = done.filter(Boolean).length;
  return { done, n, next: n > 0 && n < START_SLUGS.length ? done.indexOf(false) : -1 };
}
