// On-screen words, drawn on the 2D layer above the 3D. Arabic is shaped by the browser, so a line
// is always animated as a whole (never letter by letter, which would break the joined letters).
import { clamp, ease, range } from './util.js';

export const FONT = { display: 'Messiri', body: 'Plex', mono: 'Mono' };

/**
 * Draw one line of text with an entrance and exit.
 * o: { text, x, y, size, font='display', weight=600, color, align='center', t, in, out, dur=0.9,
 *      style: 'rise' (up + blur to sharp) | 'wipe' (reveal in reading direction) | 'fade',
 *      rtl (default from g.lang), glow (px), letter (letter-spacing px, Latin only), alpha }
 * `in`/`out` are the times (scene seconds) when it starts arriving / starts leaving.
 */
export function line(g, o) {
  const rtl = o.rtl ?? g.lang === 'ar';
  const kIn = ease.out(range(o.t, o.in, o.in + (o.dur ?? 0.9)));
  const kOut = o.out == null ? 0 : ease.in(range(o.t, o.out, o.out + (o.outDur ?? 0.6)));
  const a = kIn * (1 - kOut) * (o.alpha ?? 1);
  if (a <= 0.001) return;
  g.save();
  g.globalAlpha = a;
  g.direction = rtl ? 'rtl' : 'ltr';
  g.font = `${o.weight ?? 600} ${o.size}px ${FONT[o.font ?? 'display']}`;
  g.textAlign = o.align ?? 'center';
  g.textBaseline = 'alphabetic';
  if (o.letter && !rtl) g.letterSpacing = `${o.letter}px`;
  let dy = 0, blur = 0;
  const style = o.style ?? 'rise';
  if (style === 'rise') { dy = (1 - kIn) * o.size * 0.45 - kOut * o.size * 0.2; blur = (1 - kIn) * 14 + kOut * 10; }
  if (blur > 0.3) g.filter = `blur(${blur.toFixed(1)}px)`;
  if (o.glow) { g.shadowColor = o.glowColor ?? o.color; g.shadowBlur = o.glow; }
  g.fillStyle = o.color ?? '#f3ece3';
  if (style === 'wipe') {
    const w = g.measureText(o.text).width + o.size;
    const x0 = o.align === 'center' ? o.x - w / 2 : (o.align === 'right') === !rtl ? o.x - w : o.x;
    const p = kIn;
    g.beginPath();
    if (!rtl) g.rect(x0 - o.size, o.y - o.size * 1.4, (w + o.size) * p, o.size * 2);
    else g.rect(x0 + w - (w + o.size) * p, o.y - o.size * 1.4, (w + o.size) * p + o.size, o.size * 2);
    g.clip();
  }
  g.fillText(o.text, o.x, o.y + dy);
  g.restore();
}

/** A soft dark band behind text so it stays readable over bright 3D. */
export function scrim(g, { y, h, alpha = 0.55, t = 1 }) {
  const W = g.canvas.width;
  const grd = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  grd.addColorStop(0, 'rgba(8,5,3,0)'); grd.addColorStop(0.5, `rgba(8,5,3,${alpha * clamp(t)})`); grd.addColorStop(1, 'rgba(8,5,3,0)');
  g.fillStyle = grd; g.fillRect(0, y - h / 2, W, h);
}
