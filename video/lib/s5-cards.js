// s5 helpers: frosted-glass UI card faces drawn once on canvases (sharp + pre-blurred for depth of field).
// Canvas units: every card is CW x CH px; anchors are returned in those px so 3D overlays can line up.
export const CW = 1600, CH = 1000;
const PAD = 96;
const CREAM = '#f6efe6', MUTED = 'rgba(243,236,227,0.55)', AMBER = '#f2a33a', HOT = '#ffd79a';
export const PARTS = ['#f2a33a', '#3fb3a7', '#e0705f', '#7fa6ea'];

function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

function wrap(g, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}

/** Glass slab look: translucent warm fill, frost grain, top sheen and a lit edge. */
function glass(g, rng) {
  rr(g, 6, 6, CW - 12, CH - 12, 64);
  const f = g.createLinearGradient(0, 0, CW, CH);
  g.fillStyle = 'rgba(34,22,15,0.62)'; g.fill();
  f.addColorStop(0, 'rgba(255,232,205,0.17)'); f.addColorStop(0.55, 'rgba(255,214,170,0.08)'); f.addColorStop(1, 'rgba(255,196,140,0.12)');
  g.fillStyle = f; g.fill();
  g.save(); g.clip();
  // frost: fine grain
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(255,240,225,${0.025 + rng() * 0.04})`; g.fillRect(rng() * CW, rng() * CH, 2, 2); }
  // soft sheen across the top-left
  const s = g.createRadialGradient(CW * 0.2, -CH * 0.2, 0, CW * 0.2, -CH * 0.2, CW * 0.9);
  s.addColorStop(0, 'rgba(255,245,230,0.22)'); s.addColorStop(1, 'rgba(255,245,230,0)');
  g.fillStyle = s; g.fillRect(0, 0, CW, CH);
  g.restore();
  // lit edge
  rr(g, 6, 6, CW - 12, CH - 12, 64);
  const e = g.createLinearGradient(0, 0, CW * 0.6, CH);
  e.addColorStop(0, 'rgba(255,240,220,0.85)'); e.addColorStop(0.5, 'rgba(255,220,180,0.25)'); e.addColorStop(1, 'rgba(255,200,150,0.45)');
  g.strokeStyle = e; g.lineWidth = 4; g.stroke();
}

function title(g, text, ar) {
  g.font = `600 ${ar ? 104 : 98}px Plex`; g.direction = ar ? 'rtl' : 'ltr'; g.textAlign = ar ? 'right' : 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = CREAM;
  const lines = wrap(g, text, CW - PAD * 2);
  lines.forEach((l, i) => g.fillText(l, ar ? CW - PAD : PAD, 176 + i * 118));
  return 176 + (lines.length - 1) * 118;
}

/**
 * kind: 'prompt' | 'audio' | 'score' | 'lang'. Returns { canvas, blur, anchors }.
 * Anchors (canvas px) for the 3D overlays animated per frame.
 */
export function drawCard(kind, text, ar, rng, extra = {}) {
  const c = document.createElement('canvas'); c.width = CW; c.height = CH;
  const g = c.getContext('2d');
  glass(g, rng);
  const ty = title(g, text, ar);
  const X = x => (ar ? CW - x : x);         // mirror for right-to-left
  const top = Math.max(330, ty + 80), anchors = {};

  if (kind === 'prompt') {
    // prompt box with four colour-coded lines (the bars themselves grow in 3D)
    const bx = PAD, bw = CW - PAD * 2, by = top, bh = 380;
    rr(g, bx, by, bw, bh, 36); g.fillStyle = 'rgba(12,7,4,0.42)'; g.fill();
    g.strokeStyle = 'rgba(255,230,200,0.18)'; g.lineWidth = 2; g.stroke();
    const lens = [0.82, 0.94, 0.7, 0.52];
    anchors.rows = lens.map((len, i) => {
      const y = by + 70 + i * 80, x0 = bx + 70, w = (bw - 140) * len;
      g.fillStyle = PARTS[i]; g.beginPath(); g.arc(X(x0), y, 11, 0, Math.PI * 2); g.fill();
      rr(g, ar ? CW - (x0 + 40 + w) : x0 + 40, y - 13, w, 26, 13); g.fillStyle = 'rgba(243,236,227,0.10)'; g.fill();
      return { x: x0 + 40, y, w, h: 26 };
    });
    // the two buttons
    const by2 = by + bh + 50, bh2 = 132;
    g.font = '600 64px Plex'; g.direction = 'ltr'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const names = extra.buttons;
    const w1 = g.measureText(names[0]).width + 130, w2 = g.measureText(names[1]).width + 130;
    const x1 = PAD, x2 = PAD + w1 + 36;
    const b1 = { x: X(x1 + w1 / 2), y: by2 + bh2 / 2, w: w1, h: bh2 }, b2 = { x: X(x2 + w2 / 2), y: by2 + bh2 / 2, w: w2, h: bh2 };
    const fill = g.createLinearGradient(0, by2, 0, by2 + bh2); fill.addColorStop(0, '#ffc46e'); fill.addColorStop(1, '#e8902e');
    rr(g, b1.x - w1 / 2, by2, w1, bh2, bh2 / 2); g.fillStyle = fill; g.fill();
    g.fillStyle = '#1c1008'; g.fillText(names[0], b1.x, b1.y + 2);
    rr(g, b2.x - w2 / 2, by2, w2, bh2, bh2 / 2); g.fillStyle = 'rgba(255,236,214,0.10)'; g.fill();
    g.strokeStyle = 'rgba(255,215,154,0.75)'; g.lineWidth = 4; g.stroke();
    g.fillStyle = HOT; g.fillText(names[1], b2.x, b2.y + 2);
    anchors.b1 = b1; anchors.b2 = b2;
  }

  if (kind === 'audio') {
    const cy = top + 250, pr = 128, px = X(PAD + pr);
    // play button
    const pg = g.createLinearGradient(0, cy - pr, 0, cy + pr); pg.addColorStop(0, '#ffc46e'); pg.addColorStop(1, '#e48a2a');
    g.fillStyle = pg; g.beginPath(); g.arc(px, cy, pr, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1c1008'; g.beginPath();
    g.moveTo(px - 38, cy - 56); g.lineTo(px + 62, cy); g.lineTo(px - 38, cy + 56); g.closePath(); g.fill();
    // waveform
    const wx0 = PAD + pr * 2 + 80, wx1 = CW - PAD, n = 46, step = (wx1 - wx0) / n, bars = [];
    for (let i = 0; i < n; i++) {
      const env = 0.35 + 0.65 * Math.sin((i / n) * Math.PI) ** 0.6;
      bars.push(Math.max(0.12, env * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7) * 0.6 + (rng() - 0.5) * 0.9))));
    }
    const drawWave = (gg, col) => { gg.fillStyle = col; bars.forEach((h, i) => { const x = X(wx0 + i * step + step * 0.2) - (ar ? step * 0.6 : 0), hh = h * 300; rr(gg, x, cy - hh / 2, step * 0.6, hh, step * 0.3); gg.fill(); }); };
    drawWave(g, 'rgba(243,236,227,0.30)');
    // track line under the wave
    rr(g, Math.min(X(wx0), X(wx1)), cy + 200, wx1 - wx0, 10, 5); g.fillStyle = 'rgba(243,236,227,0.16)'; g.fill();
    // separate canvas: the "played" wave in amber (revealed over time in 3D)
    const pc = document.createElement('canvas'); pc.width = CW; pc.height = CH;
    const pgc = pc.getContext('2d'); drawWave(pgc, HOT);
    rr(pgc, Math.min(X(wx0), X(wx1)), cy + 200, wx1 - wx0, 10, 5); pgc.fillStyle = AMBER; pgc.fill();
    anchors.wave = { x0: wx0, x1: wx1, cy, h: 470, played: pc };
  }

  if (kind === 'score') {
    const R = 190, cx = X(PAD + R + 10), cy = top + 260;
    g.strokeStyle = 'rgba(243,236,227,0.14)'; g.lineWidth = 34; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.font = '400 52px Plex'; g.direction = 'ltr'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = MUTED;
    g.fillText('/100', cx, cy + 112);
    anchors.ring = { cx, cy, R, w: 34 };
    // four sub-scores, one per prompt part
    const vals = [0.92, 0.84, 0.78, 0.9], bx = PAD + R * 2 + 120, bw = CW - PAD - bx;
    anchors.subs = vals.map((v, i) => {
      const y = cy - 150 + i * 100;
      rr(g, ar ? CW - bx - bw : bx, y - 14, bw, 28, 14); g.fillStyle = 'rgba(243,236,227,0.12)'; g.fill();
      g.fillStyle = PARTS[i]; g.beginPath(); g.arc(X(bx - 40), y, 12, 0, Math.PI * 2); g.fill();
      return { x: bx, y, w: bw * v, h: 28 };
    });
  }

  if (kind === 'lang') {
    const tw = 880, th = 230, tx = (CW - tw) / 2, ty2 = top + 120;
    rr(g, tx, ty2, tw, th, th / 2); g.fillStyle = 'rgba(12,7,4,0.45)'; g.fill();
    g.strokeStyle = 'rgba(255,230,200,0.3)'; g.lineWidth = 3; g.stroke();
    // the dot between the two options
    g.fillStyle = 'rgba(243,236,227,0.45)'; g.beginPath(); g.arc(CW / 2, ty2 + th / 2, 9, 0, Math.PI * 2); g.fill();
    anchors.toggle = { x: tx, y: ty2, w: tw, h: th };
    // labels go on their own canvas, above the sliding knob
    const lc = document.createElement('canvas'); lc.width = CW; lc.height = CH;
    const lg = lc.getContext('2d'); lg.textAlign = 'center'; lg.textBaseline = 'middle'; lg.fillStyle = CREAM;
    lg.font = '600 104px Plex'; lg.direction = 'ltr'; lg.fillText('EN', tx + tw * 0.25, ty2 + th / 2 + 4);
    lg.font = '600 128px Messiri'; lg.direction = 'rtl'; lg.fillText('ع', tx + tw * 0.75, ty2 + th / 2 - 4);
    anchors.labels = lc;
    // the same labels in dark ink: shown only inside the knob (cropped in 3D)
    const dc = document.createElement('canvas'); dc.width = CW; dc.height = CH;
    const dg = dc.getContext('2d'); dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillStyle = '#24140a';
    dg.font = '600 104px Plex'; dg.direction = 'ltr'; dg.fillText('EN', tx + tw * 0.25, ty2 + th / 2 + 4);
    dg.font = '600 128px Messiri'; dg.direction = 'rtl'; dg.fillText('ع', tx + tw * 0.75, ty2 + th / 2 - 4);
    anchors.labelsDark = dc;
  }

  const b = document.createElement('canvas'); b.width = CW; b.height = CH;
  const bg = b.getContext('2d'); bg.filter = 'blur(13px)'; bg.drawImage(c, 0, 0);
  return { canvas: c, blur: b, anchors };
}

/** A soft bokeh disc (slightly brighter rim, like a real lens). */
export function bokehCanvas(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), h = size / 2;
  const grd = g.createRadialGradient(h, h, 0, h, h, h);
  grd.addColorStop(0, 'rgba(255,255,255,0.55)'); grd.addColorStop(0.78, 'rgba(255,255,255,0.7)'); grd.addColorStop(0.9, 'rgba(255,255,255,0.85)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.beginPath(); g.arc(h, h, h, 0, Math.PI * 2); g.fill();
  return c;
}
