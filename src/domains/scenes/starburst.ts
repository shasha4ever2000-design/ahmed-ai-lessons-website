// Celebration: eight-point stars burst from a point and fall away. Used when a lesson is
// finished, when a prompt reaches 100%, and when Start Here step 1 completes.
import { motion, onTick } from '../motion/kernel';

const COLORS = ['#f2a33a', '#3fb3a7', '#e0705f', '#7fa6ea', '#f7d38a'];
let canvas: HTMLCanvasElement | null = null, ctx: CanvasRenderingContext2D | null = null;
type P = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; life: number; c: string };
const parts: P[] = [];
let stop: (() => void) | null = null;

function star(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8, rad = k % 2 ? r * 0.55 : r; c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
  c.closePath(); c.fill();
}
function ensure() {
  if (canvas) return;
  canvas = document.createElement('canvas'); canvas.className = 'starburst'; canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas); ctx = canvas.getContext('2d');
  const size = () => { const d = Math.min(devicePixelRatio, 2); canvas!.width = innerWidth * d; canvas!.height = innerHeight * d; ctx!.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
}

/** Burst from a viewport point (defaults to screen centre). Does nothing when motion is reduced. */
export function burst(x = innerWidth / 2, y = innerHeight / 2, count = 34) {
  if (!motion.allowed) return;
  ensure();
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, s = 180 + Math.random() * 420;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 160, r: 4 + Math.random() * 7, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8, life: 1, c: COLORS[i % COLORS.length] });
  }
  if (!stop) stop = onTick((_, dt) => {
    ctx!.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += 620 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= dt * 0.75;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx!.save(); ctx!.globalAlpha = Math.min(1, p.life * 1.6); ctx!.fillStyle = p.c; ctx!.translate(p.x, p.y); ctx!.rotate(p.rot); star(ctx!, p.r); ctx!.restore();
    }
    if (!parts.length) { ctx!.clearRect(0, 0, innerWidth, innerHeight); stop!(); stop = null; }
  });
}

/** Burst from the centre of an element. */
export function burstFrom(el: Element | null, count?: number) {
  if (!el) return burst(undefined, undefined, count);
  const b = el.getBoundingClientRect(); burst(b.left + b.width / 2, b.top + b.height / 2, count);
}
