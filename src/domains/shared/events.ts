// Domain events: the only way bounded contexts talk to each other.
// Built on window CustomEvents, so separate page scripts (islands) can share them without importing each other.

export interface DomainEvents {
  'learning:progress-changed': { done: string[]; step1: boolean };
  'learning:lesson-completed': { slug: string; total: number };
  'learning:step-completed': { step: number };
  'builder:score-changed': { score: number; parts: boolean[] };
  'builder:part-filled': { index: number; from: DOMRect | null };
  'theme:changed': { theme: 'light' | 'dark' };
}
type Name = keyof DomainEvents;

export function emit<N extends Name>(name: N, detail: DomainEvents[N]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<N extends Name>(name: N, fn: (detail: DomainEvents[N]) => void) {
  const h = (e: Event) => fn((e as CustomEvent).detail);
  window.addEventListener(name, h);
  return () => window.removeEventListener(name, h);
}
