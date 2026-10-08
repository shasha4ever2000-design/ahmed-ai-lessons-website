// Application layer for every page: boots the motion kernel and the shared effects, and
// connects learning events to their celebrations. Pages add their own use cases on top.
import { bootKernel, motion } from '../domains/motion/kernel';
import { readFraction } from '../domains/learning/resume';
import { bootReveal, bootCounters } from '../domains/motion/reveal';
import { bootTilt, bootLantern } from '../domains/motion/pointer';
import { on } from '../domains/shared/events';
import { doneLessons, TOTAL_LESSONS } from '../domains/learning/progress';
import { burstFrom } from '../domains/scenes/starburst';
import { toast } from '../domains/scenes/toast';
import { haptic } from '../domains/motion/haptics';

bootKernel();
// Lesson bodies are stored HTML; tag their sections so they rise in as you read.
document.querySelectorAll('.lesson-body > section, .lesson-body > figure, .lesson-body > .prose').forEach(el => el.setAttribute('data-reveal', ''));
bootReveal();
bootCounters();
bootTilt();
bootLantern();

// Lesson cards anywhere on the page show a tick for finished lessons, and update live.
function paintCards() {
  const done = doneLessons();
  document.querySelectorAll<HTMLElement>('.lesson-card').forEach(c => {
    const t = c.querySelector<HTMLElement>('.card__done'); if (t) t.hidden = !done.includes(c.dataset.slug!);
  });
}
paintCards();
on('learning:progress-changed', paintCards);

// Celebrate a finished lesson: stars from the button that was pressed, and a short message.
const root = document.documentElement;
let lastPressed: Element | null = null;
document.addEventListener('pointerdown', e => (lastPressed = (e.target as Element).closest('button')), { capture: true });
on('learning:lesson-completed', ({ total }) => {
  burstFrom(lastPressed);
  const ar = root.lang === 'ar';
  toast(ar ? `برافو عليك. خلّصت ${total} من ${TOTAL_LESSONS} درس.` : `Lesson done. ${total} of ${TOTAL_LESSONS} finished.`);
});

// The header shows its edge only once there's content scrolled underneath it.
// A 1px marker at the top of the page tells us, without listening to every scroll.
const marker = document.createElement('div');
marker.setAttribute('aria-hidden', 'true');
marker.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:4px;pointer-events:none';
document.body.prepend(marker);
new IntersectionObserver(([e]) => document.documentElement.classList.toggle('is-scrolled', !e.isIntersecting)).observe(marker);

// A light vibration for the moments that matter (Android), on the same frame as the visual.
on('learning:lesson-completed', () => haptic('success'));
on('prompts:saved-changed', e => { if (e.saved) haptic('select'); });
let lastScore = -1;
on('builder:score-changed', ({ score }) => { if (score === 100 && lastScore >= 0 && lastScore < 100) haptic('complete'); lastScore = score; });

// Reading progress on long pages: a lattice strip under the header fills with light.
const bar = document.querySelector<HTMLElement>('.read-bar');
if (bar) {
  const set = () => {
    const a = document.querySelector<HTMLElement>('[data-read-scope]') || document.body;
    bar.style.setProperty('--read', readFraction(a).toFixed(4));
  };
  set(); addEventListener('scroll', set, { passive: true }); addEventListener('resize', set, { passive: true });
}

// Expose for quick checks in the browser console (no effect on visitors).
(window as any).__ahlMotion = motion;
