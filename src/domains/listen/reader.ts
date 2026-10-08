// Reads a lesson aloud with the device's own voice (Web Speech API), one part at a time.
// One utterance per paragraph keeps long lessons reliable, makes "back" and "skip" exact,
// and lets the page highlight what is being read.

export interface ReaderState { playing: boolean; index: number; total: number; rate: number }
type Listener = (s: ReaderState) => void;

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
export const RATES = [1, 1.25, 1.5, 0.85];

// The best voice the device has for the page language: Egyptian Arabic first for Arabic,
// then any Arabic; for English, the more natural-sounding voices first.
export function pickVoice(voices: SpeechSynthesisVoice[], lang: 'en' | 'ar') {
  const mine = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
  if (!mine.length) return null;
  const score = (v: SpeechSynthesisVoice) => {
    const l = v.lang.toLowerCase(), n = v.name.toLowerCase();
    let s = 0;
    if (lang === 'ar') { if (l.includes('eg')) s += 8; else if (l.includes('sa')) s += 2; }
    else { if (l.includes('us') || l.includes('gb')) s += 2; }
    if (/natural|neural|online|google|premium|enhanced|siri/.test(n)) s += 4;
    if (v.localService) s += 1;
    return s;
  };
  return mine.sort((a, b) => score(b) - score(a))[0];
}

// Voices arrive late in some browsers; wait a moment for them.
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!synth) return Promise.resolve([]);
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise(res => {
    const done = () => res(synth.getVoices());
    synth.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 1500);
  });
}

// What to read: the title, the intro line, then every heading, paragraph, list item, prompt and table row.
// Buttons, labels and the colour legend under prompts are left out.
const SKIP = '.lesson-end, .sheet__head, .compare__head, .legend-line, .blank-hint, .try-in, .visually-hidden, [aria-hidden=true], .prompt-download, .text-size';
export function readableParts(root: HTMLElement): HTMLElement[] {
  const head = [...document.querySelectorAll<HTMLElement>('#lesson-title, .lesson-hero .lede')];
  const all = [...root.querySelectorAll<HTMLElement>('h2, h3, p, li, tr, .sheet__text, .compare__text')]
    .filter(el => !el.closest(SKIP) && el.offsetParent !== null);
  // A list item that holds a paragraph is read through the paragraph, not twice.
  const body = all.filter(el => !all.some(o => o !== el && el.contains(o)));
  return [...head, ...body].filter(el => textOf(el).length > 1);
}
export const textOf = (el: HTMLElement) => (el.innerText || '').replace(/\t+/g, ', ').replace(/\s+/g, ' ').trim();

export class Reader {
  private parts: HTMLElement[];
  private voice: SpeechSynthesisVoice;
  private listeners = new Set<Listener>();
  private keepAlive = 0;
  private token = 0;
  state: ReaderState;

  constructor(parts: HTMLElement[], voice: SpeechSynthesisVoice) {
    this.parts = parts;
    this.voice = voice;
    this.state = { playing: false, index: 0, total: parts.length, rate: 1 };
  }
  part(i = this.state.index) { return this.parts[i]; }
  subscribe(fn: Listener) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private set(p: Partial<ReaderState>) { this.state = { ...this.state, ...p }; this.listeners.forEach(f => f(this.state)); }

  play(from = this.state.index) {
    if (!synth) return;
    const i = Math.max(0, Math.min(from, this.parts.length - 1));
    const my = ++this.token;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(textOf(this.parts[i]));
    u.voice = this.voice; u.lang = this.voice.lang; u.rate = this.state.rate;
    u.onend = () => {
      if (my !== this.token) return;
      if (i + 1 < this.parts.length) this.play(i + 1);
      else { this.stopTimer(); this.set({ playing: false, index: 0 }); }
    };
    u.onerror = e => { if (my === this.token && e.error !== 'interrupted' && e.error !== 'canceled') { this.stopTimer(); this.set({ playing: false }); } };
    this.set({ playing: true, index: i });
    synth.speak(u);
    // Desktop Chrome goes quiet on long speech unless nudged now and then (not needed, and harmful, on Android).
    if (!this.keepAlive && !/android/i.test(navigator.userAgent)) this.keepAlive = window.setInterval(() => { if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); } }, 10000);
  }
  // Pausing stops the current part and remembers it; playing again starts that part over.
  // (The browser's own pause is unreliable on phones.)
  pause() { this.token++; synth?.cancel(); this.stopTimer(); this.set({ playing: false }); }
  toggle() { this.state.playing ? this.pause() : this.play(); }
  step(d: number) { const i = this.state.index + d; if (i < 0 || i >= this.parts.length) return; this.state.playing ? this.play(i) : this.set({ index: i }); }
  cycleRate() {
    const r = RATES[(RATES.indexOf(this.state.rate) + 1) % RATES.length];
    this.set({ rate: r });
    if (this.state.playing) this.play(this.state.index);
    return r;
  }
  stop() { this.pause(); this.set({ index: 0 }); }
  private stopTimer() { clearInterval(this.keepAlive); this.keepAlive = 0; }
}
