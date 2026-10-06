// Infrastructure: browser storage for the learning context. Keys are unchanged from the old site,
// so visitors keep their progress. Every read and write survives blocked or full storage.
export const KEYS = { done: 'ahl:done', cert: 'ahl:cert' } as const;

export function read<T>(key: string, fallback: T): T {
  try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return (v ?? fallback) as T; } catch { return fallback; }
}
export function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode or full: progress just isn't saved */ }
}
