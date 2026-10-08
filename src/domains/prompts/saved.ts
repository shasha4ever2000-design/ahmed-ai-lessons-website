// Saved prompts: a personal collection of prompt cards, kept in this browser.
import { KEYS, read, write } from '../learning/storage';
import { emit } from '../shared/events';

export interface SavedPrompt { id: string; lang: string; slug: string; lesson: string; label: string; text: string; at: number }

export function savedPrompts(): SavedPrompt[] {
  const list = read<unknown>(KEYS.saved, []);
  return Array.isArray(list) ? list.filter((x): x is SavedPrompt => !!x && typeof x.id === 'string' && typeof x.text === 'string') : [];
}
export const isSaved = (id: string) => savedPrompts().some(p => p.id === id);

/** Save or unsave; returns the new state. Newest first. */
export function toggleSaved(p: Omit<SavedPrompt, 'at'>): boolean {
  const list = savedPrompts();
  const had = list.some(x => x.id === p.id);
  const next = had ? list.filter(x => x.id !== p.id) : [{ ...p, at: Date.now() }, ...list].slice(0, 200);
  write(KEYS.saved, next);
  emit('prompts:saved-changed', { count: next.length, id: p.id, saved: !had });
  return !had;
}

export function removeSaved(id: string) {
  const next = savedPrompts().filter(x => x.id !== id);
  write(KEYS.saved, next);
  emit('prompts:saved-changed', { count: next.length, id, saved: false });
}
