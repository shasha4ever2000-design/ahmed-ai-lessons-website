// Original synthesized score for the 48 s promo film.
// Pure Node, no samples, deterministic. Writes video/audio/score.wav (48 kHz, stereo, 16-bit PCM).
// Run: node video/audio/score.cjs
'use strict';
const fs = require('fs');
const path = require('path');

const SR = 48000;
const DUR = 48.0;
const N = Math.round(SR * DUR);
const TAU = Math.PI * 2;

// ---------- buses ----------
const dryL = new Float32Array(N), dryR = new Float32Array(N);   // direct mix
const sendL = new Float32Array(N), sendR = new Float32Array(N); // reverb send
const padL = new Float32Array(N), padR = new Float32Array(N);   // pad bus (filtered later)

// ---------- helpers ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(48048);
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Fs: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
// 'D4' -> midi
function m(name) {
  const mm = /^([A-G](?:b|s)?)(-?\d)$/.exec(name);
  return NOTE[mm[1]] + 12 * (parseInt(mm[2], 10) + 1);
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
function panGains(p) { // equal power, p in [-1,1]
  const a = (p + 1) * Math.PI / 4;
  return [Math.cos(a), Math.sin(a)];
}
function put(i, l, r, send) {
  dryL[i] += l; dryR[i] += r;
  if (send) { sendL[i] += l * send; sendR[i] += r * send; }
}
// piecewise-linear automation [[t, v], ...]
function auto(points) {
  return (t) => {
    if (t <= points[0][0]) return points[0][1];
    for (let k = 1; k < points.length; k++) {
      if (t <= points[k][0]) {
        const [t0, v0] = points[k - 1], [t1, v1] = points[k];
        return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
      }
    }
    return points[points.length - 1][1];
  };
}
// TPT state-variable filter
class SVF {
  constructor() { this.ic1 = 0; this.ic2 = 0; }
  run(x, fc, q) {
    const g = Math.tan(Math.PI * clamp(fc, 10, SR * 0.45) / SR);
    const k = 1 / q;
    const a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
    const v3 = x - this.ic2;
    const v1 = a1 * this.ic1 + a2 * v3;
    const v2 = this.ic2 + a2 * this.ic1 + a3 * v3;
    this.ic1 = 2 * v1 - this.ic1; this.ic2 = 2 * v2 - this.ic2;
    this.lp = v2; this.bp = v1; this.hp = x - k * v1 - v2;
    return this;
  }
}
function polyblep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}

// ---------- musical grid ----------
// Beat = 0.8 s (75 bpm), anchored so the gem hits (25.0, 26.6, 28.2, 29.8) land on beats.
const BEAT = 0.8;
const beat = (k) => 25.0 + k * BEAT;

// =====================================================================
// 1) INTRO 0-6 s: cold noise riser, glitch ticks, dissonant drone that resolves at 6 s
// =====================================================================
(function introNoise() {
  const fL = new SVF(), fR = new SVF(), hL = new SVF(), hR = new SVF();
  const t1 = 6.02;
  for (let i = 0; i < t1 * SR; i++) {
    const t = i / SR, k = t / 6;
    const fc = 700 * Math.pow(10, k);                 // 700 Hz -> 7 kHz sweep
    const q = 1.2 + 4 * k;
    const nL = rnd() * 2 - 1, nR = rnd() * 2 - 1;
    const bl = fL.run(nL, fc, q).bp, br = fR.run(nR, fc * 1.07, q).bp;
    const hl = hL.run(nL, 9000, 0.7).hp, hr = hR.run(nR, 9000, 0.7).hp; // cold air
    let g = 0.02 + 0.15 * Math.pow(k, 2.6);
    if (t > 5.97) g *= Math.max(0, 1 - (t - 5.97) / 0.05);  // sucked away at the turn
    const fade = Math.min(1, t / 0.25);
    const air = (0.006 + 0.014 * k) * fade;
    put(i, (bl * g + hl * air) * fade, (br * g + hr * air) * fade, 0.35);
  }
})();

(function glitchTicks() {
  let t = 0.15;
  while (t < 5.9) {
    const k = t / 6;
    const rate = 3 + 26 * k * k;           // events per second, accelerating
    const amp = 0.05 + 0.13 * k;
    const pan = rnd() * 1.6 - 0.8;
    const [gl, gr] = panGains(pan);
    const type = rnd();
    const i0 = Math.floor(t * SR);
    if (type < 0.45) { // click: tiny highpassed noise burst
      const len = Math.floor(SR * (0.001 + rnd() * 0.002));
      const f = new SVF();
      for (let j = 0; j < len && i0 + j < N; j++) {
        const e = 1 - j / len;
        const s = f.run(rnd() * 2 - 1, 3500, 0.8).hp * e * amp * 1.6;
        put(i0 + j, s * gl, s * gr, 0.25);
      }
    } else if (type < 0.8) { // digital blip: square-ish sine
      const fr = 1800 + rnd() * 5200;
      const len = Math.floor(SR * (0.004 + rnd() * 0.016));
      for (let j = 0; j < len && i0 + j < N; j++) {
        const e = Math.min(1, j / 24) * Math.min(1, (len - j) / 48);
        const s = Math.tanh(3 * Math.sin(TAU * fr * j / SR)) * e * amp * 0.5;
        put(i0 + j, s * gl, s * gr, 0.2);
      }
    } else { // stutter: repeated micro-burst
      const reps = 3 + Math.floor(rnd() * 4), gap = Math.floor(SR * (0.012 + rnd() * 0.012));
      const fr = 900 + rnd() * 2500;
      for (let r = 0; r < reps; r++) {
        for (let j = 0; j < 140; j++) {
          const idx = i0 + r * gap + j; if (idx >= N) break;
          const s = Math.sin(TAU * fr * j / SR) * (1 - j / 140) * amp * 0.6 * (1 - r / (reps + 1));
          put(idx, s * gl, s * gr, 0.25);
        }
      }
    }
    t += (-Math.log(1 - rnd()) / rate);
  }
})();

// Drone: D2 + Eb3 + Ab3 (minor 9th + tritone), cold high D6/Eb6 beating pair.
// From 5.5 to 6.15 s the Eb bends down to D and the Ab up to A: the dissonance resolves into an open fifth.
(function drone() {
  const tEnd = 8.5;
  const voices = [
    { from: m('D2'), to: m('D2'), amp: 0.11, pan: 0 },
    { from: m('Eb3'), to: m('D3'), amp: 0.07, pan: -0.5 },
    { from: m('Ab3'), to: m('A3'), amp: 0.06, pan: 0.5 },
  ];
  for (const v of voices) {
    const fL = new SVF(), fR = new SVF();
    let ph1 = 0, ph2 = 0.37;
    for (let i = 0; i < tEnd * SR; i++) {
      const t = i / SR;
      const bend = smooth((t - 5.5) / 0.65);
      const f = mtof(v.from + (v.to - v.from) * bend);
      const f1 = f * 1.004, f2 = f * 0.996;
      ph1 += f1 / SR; if (ph1 >= 1) ph1 -= 1;
      ph2 += f2 / SR; if (ph2 >= 1) ph2 -= 1;
      const s1 = 2 * ph1 - 1 - polyblep(ph1, f1 / SR), s2 = 2 * ph2 - 1 - polyblep(ph2, f2 / SR);
      // cold & brightening while tense, then darkening to warm after the turn
      const fc = t < 6 ? 300 + 1400 * Math.pow(t / 6, 2) : 1700 * Math.exp(-(t - 6) / 0.6) + 350;
      const lp1 = fL.run(s1, fc, 0.9).lp, lp2 = fR.run(s2, fc, 0.9).lp;
      let g = v.amp * (0.25 + 0.75 * smooth(t / 5.8)) * Math.min(1, t / 0.4);
      const trem = 1 + 0.12 * Math.sin(TAU * (3.1 + t * 0.8) * t);
      if (t > 6) g *= Math.exp(-(t - 6) / 0.9);           // hands over to the pad
      const [gl, gr] = panGains(v.pan);
      put(i, (lp1 * 0.8 + lp2 * 0.2) * g * trem * gl, (lp2 * 0.8 + lp1 * 0.2) * g * trem * gr, 0.2);
    }
  }
  // high cold beating pair
  for (let i = 0; i < 6.05 * SR; i++) {
    const t = i / SR;
    const g = 0.012 * smooth(t / 4) * (t > 5.95 ? Math.max(0, 1 - (t - 5.95) / 0.1) : 1);
    const a = Math.sin(TAU * mtof(m('D6')) * t), b = Math.sin(TAU * mtof(m('Eb6')) * t);
    put(i, (a * 0.7 + b * 0.3) * g, (b * 0.7 + a * 0.3) * g, 0.4);
  }
})();

// =====================================================================
// 2) PAD: warm detuned saws through a lowpass that opens with the light
// =====================================================================
const ch = (names) => names.split(' ').map(m);
const chords = [
  // t0, t1, notes, attack, level
  [6.0, 11.0, ch('D2 A2 D3 F3 A3 E4'), 1.6, 1.0],         // the turn: Dm(add9) swells in
  [11.0, 14.0, ch('Bb1 F2 D3 F3 A3 C4'), 1.2, 1.0],       // Bbmaj9
  [14.0, 17.0, ch('D2 A2 C3 F3 A3 E4'), 1.0, 0.9],        // Dm9
  [17.0, 20.2, ch('Bb1 F2 D3 A3 C4 F4'), 1.0, 0.9],       // Bbmaj9
  [20.2, 23.4, ch('G1 D2 F3 Bb3 D4 A4'), 1.0, 0.9],       // Gm9
  [23.4, 24.6, ch('A1 E2 D3 E3 A3 D4'), 0.8, 0.85],       // Asus4 (lean into the gems)
  [24.6, 30.5, ch('D2 A2 C3 F3 A3 E4'), 0.9, 0.85],       // Dm9 under the four gems
  [30.5, 33.0, ch('Bb1 F2 D3 F3 A3 C4 D4 F4'), 0.35, 1.25], // BLOOM: full Bbmaj9
  [33.0, 35.4, ch('F2 C3 F3 G3 A3 C4'), 0.8, 0.9],        // Fadd9 (optimistic)
  [35.4, 37.8, ch('E2 C3 E3 G3 D4 E4'), 0.8, 0.9],        // C/E add9
  [37.8, 39.4, ch('Bb1 G2 D3 F3 Bb3 D4'), 0.8, 0.9],      // Gm/Bb
  [39.4, 41.0, ch('A1 E2 D3 E3 A3 E4'), 0.7, 0.9],        // Asus4 -> resolves
  [41.0, 48.0, ch('D2 A2 D3 Fs3 A3 E4 A4'), 0.45, 1.15],  // final: D major add9 (warm, Hijaz-coloured 3rd)
];
const REL = 1.6;
(function pad() {
  let seed = 1;
  for (const [t0, t1, notes, att, lvl] of chords) {
    const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor((t1 + REL * 2.2) * SR));
    notes.forEach((mn, ni) => {
      const f = mtof(mn);
      const lowness = f < 110 ? 1.25 : f < 220 ? 1.0 : f < 440 ? 0.8 : 0.6;
      const det = [-7, 0, 7.5];
      const pans = [-0.65, 0, 0.65].map((p) => p * (0.4 + 0.6 * ((ni % 3) / 2)) * (ni % 2 ? -1 : 1));
      det.forEach((c, vi) => {
        const r = mulberry32(seed++ * 97);
        let ph = r();
        const fr = f * Math.pow(2, c / 1200);
        const dt = fr / SR;
        const [gl, gr] = panGains(pans[vi]);
        const amp = 0.022 * lvl * lowness;
        const vibR = 0.15 + r() * 0.2, vibP = r() * TAU;
        for (let i = i0; i < i1; i++) {
          const t = i / SR, lt = t - t0;
          let e = Math.sin(Math.PI / 2 * clamp(lt / att, 0, 1)); e *= e;
          if (t > t1) e *= Math.exp(-(t - t1) / (REL / 3));
          if (e < 1e-5 && t > t1) break;
          const d = dt * (1 + 0.0015 * Math.sin(TAU * vibR * t + vibP));
          ph += d; if (ph >= 1) ph -= 1;
          const s = (2 * ph - 1 - polyblep(ph, d)) * amp * e;
          padL[i] += s * gl; padR[i] += s * gr;
        }
      });
      // sine sub on the bass note for warmth
      if (ni === 0) {
        const fs = f < 60 ? f * 2 : f;
        for (let i = i0; i < i1; i++) {
          const t = i / SR, lt = t - t0;
          let e = Math.sin(Math.PI / 2 * clamp(lt / att, 0, 1)); e *= e;
          if (t > t1) e *= Math.exp(-(t - t1) / (REL / 3));
          const s = Math.sin(TAU * fs * lt) * 0.07 * lvl * e;
          padL[i] += s; padR[i] += s;
        }
      }
    });
  }
  // pad bus: lowpass opens as the light pours in, blooms at 30.5, closes at the end
  const cutoff = auto([[6, 300], [8.5, 1500], [10, 1900], [14, 1400], [24, 1300], [30.3, 1500], [30.8, 2800],
    [33, 2100], [41, 1900], [44, 1100], [48, 500]]);
  const gain = auto([[0, 0], [6, 0], [7.2, 0.9], [8.5, 1.0], [14, 0.85], [24, 0.8], [30.3, 0.85], [30.7, 1.1],
    [33, 0.9], [41, 1.0], [42, 1.0]]);
  const fl = new SVF(), fr = new SVF(), fl2 = new SVF(), fr2 = new SVF();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const fc = cutoff(t);
    let g = gain(t);
    if (t > 42) g *= Math.exp(-(t - 42) / 1.6);   // final chord decays toward silence
    const l = fl2.run(fl.run(padL[i], fc, 0.6).lp, fc * 1.4, 0.7).lp;
    const r = fr2.run(fr.run(padR[i], fc, 0.6).lp, fc * 1.4, 0.7).lp;
    put(i, l * g, r * g, 0.45);
  }
})();

// =====================================================================
// 3) Impacts, swells, booms
// =====================================================================
function swell(t0, t1, amp, fLo, fHi) { // filtered noise crescendo ending at t1
  const a = new SVF(), b = new SVF();
  for (let i = Math.floor(t0 * SR); i < t1 * SR; i++) {
    const k = (i / SR - t0) / (t1 - t0);
    const fc = fLo * Math.pow(fHi / fLo, k);
    const g = amp * Math.pow(k, 3) * Math.min(1, (t1 * SR - i) / 240);
    put(i, a.run(rnd() * 2 - 1, fc, 1.1).bp * g, b.run(rnd() * 2 - 1, fc, 1.1).bp * g, 0.6);
  }
}
function boom(t0, amp, fHi, fLo, decay) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(SR * decay * 5);
  let ph = 0;
  const lp = new SVF();
  for (let j = 0; j < len && i0 + j < N; j++) {
    const t = j / SR;
    const f = fLo + (fHi - fLo) * Math.exp(-t / 0.09);
    ph += f / SR;
    const e = Math.min(1, j / 96) * Math.exp(-t / decay);
    const thump = lp.run(rnd() * 2 - 1, 260, 0.7).lp * Math.exp(-t / 0.05) * 1.5;
    const s = (Math.sin(TAU * ph) + thump) * amp * e;
    put(i0 + j, s, s, 0.5);
  }
}
// light pours in: warm swell then soft impact at 8.5 s
swell(7.0, 8.5, 0.16, 250, 3200);
boom(8.5, 0.42, 95, 40, 0.55);
// bloom at 30.5
swell(29.9, 30.5, 0.08, 400, 4000);
boom(30.5, 0.3, 85, 42, 0.5);
// final resolve
boom(41.0, 0.24, 75, 38, 0.6);

// =====================================================================
// 4) Heartbeat pulse (soft low kick, lub-dub every 1.6 s)
// =====================================================================
function kick(t0, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(SR * 0.6);
  let ph = 0;
  const lp = new SVF();
  for (let j = 0; j < len && i0 + j < N; j++) {
    const t = j / SR;
    const f = 46 + 70 * Math.exp(-t / 0.035);
    ph += f / SR;
    const e = Math.min(1, j / 48) * Math.exp(-t / 0.16);
    const click = lp.run(rnd() * 2 - 1, 900, 0.7).lp * Math.exp(-t / 0.006) * 0.25;
    const s = (Math.sin(TAU * ph) + click) * amp * e;
    put(i0 + j, s, s, 0.08);
  }
}
(function pulse() {
  const level = (t) => (t < 24.6 ? 0.30 : t < 30.4 ? 0.36 : t < 33 ? 0.32 : 0.26);
  for (let k = -12; k <= 18; k += 2) {      // 15.4 s ... 39.4 s
    const t = beat(k);
    if (t > 39.5) break;
    const ramp = k === -12 ? 0.55 : k === -10 ? 0.8 : 1;
    kick(t, level(t) * ramp);
    kick(t + 0.24, level(t) * ramp * 0.5);
  }
})();

// =====================================================================
// 5) Voices: oud-like pluck, soft bell
// =====================================================================
function pluck(t0, mn, amp, pan, dur) {
  const f0 = mtof(mn);
  const i0 = Math.floor(t0 * SR), len = Math.floor(SR * (dur || 1.8));
  const [gl, gr] = panGains(pan);
  const B = 0.00015;
  const parts = [];
  for (let n = 1; n <= 18 && n * f0 < 7500; n++) {
    parts.push({
      f: n * f0 * Math.sqrt(1 + B * n * n),
      a: Math.pow(n, -1.05) * Math.abs(Math.sin(Math.PI * n * 0.17)) * (n === 1 ? 1.4 : 1),
      tau: 0.9 / (1 + 0.55 * (n - 1)),
      ph: rnd() * 0.2,
    });
  }
  const haas = Math.floor(SR * 0.013);
  const nf = new SVF();
  for (let j = 0; j < len && i0 + j < N; j++) {
    const t = j / SR;
    const bendUp = 1 + 0.008 * Math.exp(-t / 0.025);   // oud-like pitch settle
    let s = 0;
    for (const p of parts) s += p.a * Math.exp(-t / p.tau) * Math.sin(TAU * (p.f * bendUp * t + p.ph));
    s *= Math.min(1, j / 60) * Math.min(1, (len - j) / 2400);
    s += nf.run(rnd() * 2 - 1, f0 * 3, 1.5).bp * Math.exp(-t / 0.006) * 0.6; // pick noise
    s *= amp;
    put(i0 + j, s * gl, s * gr * 0.85, 0.4);
    if (i0 + j + haas < N) { dryL[i0 + j + haas] += s * gr * 0.25; } // small Haas width
  }
}
function bell(t0, mn, amp, pan, decayScale) {
  const f0 = mtof(mn);
  const ds = decayScale || 1;
  const ratios = [1, 2.0, 3.01, 4.17, 5.43, 6.79];
  const amps = [1, 0.45, 0.22, 0.16, 0.08, 0.05];
  const decs = [3.2, 2.0, 1.3, 0.9, 0.6, 0.4].map((d) => d * ds);
  const i0 = Math.floor(t0 * SR), len = Math.floor(SR * Math.min(decs[0] * 4.5, DUR - t0));
  const [gl, gr] = panGains(pan);
  for (let j = 0; j < len && i0 + j < N; j++) {
    const t = j / SR;
    let l = 0, r = 0;
    for (let p = 0; p < ratios.length; p++) {
      if (f0 * ratios[p] > 16000) continue;
      const e = amps[p] * Math.exp(-t / decs[p]);
      l += e * Math.sin(TAU * f0 * ratios[p] * 0.9993 * t);
      r += e * Math.sin(TAU * f0 * ratios[p] * 1.0007 * t + 0.5);
    }
    const a = Math.min(1, j / 140) * amp;
    put(i0 + j, l * a * gl, r * a * gr, 0.55);
  }
}

// --- s3 motif (Kurd colour on D: the Eb is the flavour), enters after the pulse is established
const motif1 = [
  [beat(-10), 'A4', 0.8], [beat(-9.5), 'Bb4', 0.6], [beat(-9), 'A4', 1.0], [beat(-8), 'G4', 0.6],
  [beat(-7.5), 'F4', 0.7], [beat(-7), 'Eb4', 0.75], [beat(-6.5), 'D4', 1.0],
];
const motif2 = [
  [beat(-5.5), 'D4', 0.7], [beat(-5.25), 'Eb4', 0.45], [beat(-5), 'F4', 0.75], [beat(-4.5), 'G4', 0.9],
  [beat(-3.5), 'F4', 0.6], [beat(-3.25), 'Eb4', 0.5], [beat(-3), 'D4', 1.0],
];
for (const [t, n, a] of [...motif1, ...motif2]) pluck(t, m(n), 0.085 * a, 0.25, 2.0);

// --- s4: four gems, one step up each (A C D F, all inside Dm9 / Bbmaj9), panned left -> right
const gems = [[25.0, 'A4', -0.45], [26.6, 'C5', -0.15], [28.2, 'D5', 0.15], [29.8, 'F5', 0.45]];
gems.forEach(([t, n, p], idx) => {
  const lift = 1 + idx * 0.12;
  pluck(t, m(n), 0.07 * lift, p, 2.2);
  bell(t, m(n) + 12, 0.05 * lift, p, 0.9);
});
// bloom shimmer at 30.5
bell(30.5, m('D6'), 0.03, -0.3, 1.2);
bell(30.53, m('A6'), 0.022, 0.3, 1.1);
bell(30.56, m('F6'), 0.016, 0.0, 1.0);

// --- s5: motif variation, brighter, rising (inversion of the s3 descent)
const motif3 = [
  [beat(11), 'D5', 0.7], [beat(11.5), 'E5', 0.6], [beat(12), 'F5', 0.75], [beat(12.5), 'A5', 0.95],
  [beat(14), 'G5', 0.6], [beat(14.5), 'E5', 0.7], [beat(15), 'D5', 0.85],
  [beat(16), 'C5', 0.6], [beat(16.5), 'Bb4', 0.6], [beat(17), 'A4', 0.9],
];
for (const [t, n, a] of motif3) pluck(t, m(n), 0.07 * a, -0.2, 2.0);

// --- s6: soft final bell(s) over the D major chord
bell(41.0, m('D5'), 0.06, -0.1, 1.4);
bell(41.0, m('A5'), 0.025, 0.2, 1.2);
bell(43.4, m('Fs5'), 0.022, 0.25, 1.1);

// =====================================================================
// 6) s5 texture: soft shaker 16ths + woody clicks
// =====================================================================
(function shaker() {
  const acc = [0.55, 0.22, 0.85, 0.3];
  for (let s = 0; ; s++) {
    const t = 33.0 + s * 0.2;
    if (t > 40.8) break;
    const lvl = smooth((t - 33.0) / 1.2) * (1 - smooth((t - 39.8) / 1.0));
    if (lvl <= 0.001) continue;
    const i0 = Math.floor(t * SR), len = Math.floor(SR * 0.09);
    const f = new SVF();
    const pan = s % 2 ? 0.35 : -0.35;
    const [gl, gr] = panGains(pan);
    const a = 0.05 * acc[s % 4] * lvl;
    for (let j = 0; j < len && i0 + j < N; j++) {
      const tt = j / SR;
      const e = Math.min(1, j / 240) * Math.exp(-tt / 0.028);
      const v = f.run(rnd() * 2 - 1, 7000, 0.9).bp * e * a;
      put(i0 + j, v * gl, v * gr, 0.25);
    }
    // woody click on beats 2 & 4 style offbeats
    if (s % 8 === 4 || s % 16 === 14) {
      const fr = s % 8 === 4 ? 1750 : 2300;
      const [cl, cr] = panGains(s % 16 === 14 ? 0.5 : -0.5);
      for (let j = 0; j < SR * 0.05; j++) {
        const tt = j / SR;
        const v = Math.sin(TAU * fr * tt) * Math.exp(-tt / 0.008) * 0.05 * lvl;
        put(i0 + j, v * cl, v * cr, 0.3);
      }
    }
  }
})();

// =====================================================================
// 7) Reverb: FFT convolution with a generated stereo impulse
// =====================================================================
function fft(re, im, inverse) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (inverse ? 2 : -2) * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let j = 0; j < half; j++) {
        const a = i + j, b = a + half;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi;
        re[a] += xr; im[a] += xi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
function makeIR(seed) {
  const r = mulberry32(seed);
  const len = Math.floor(SR * 3.4), pre = Math.floor(SR * 0.022);
  const ir = new Float64Array(len);
  let lp = 0, energy = 0;
  for (let i = pre; i < len; i++) {
    const t = (i - pre) / SR;
    const decay = Math.exp(-6.9 * t / 2.9);                // T60 ~ 2.9 s
    const damp = clamp(0.75 - t * 0.22, 0.12, 0.75);      // darker as it decays
    lp += damp * ((r() * 2 - 1) - lp);
    const early = t < 0.08 && r() < 0.004 ? (r() * 2 - 1) * 3 : 0;
    ir[i] = (lp + early) * decay * Math.min(1, t / 0.03);
    energy += ir[i] * ir[i];
  }
  const norm = 1 / Math.sqrt(energy);
  for (let i = 0; i < len; i++) ir[i] *= norm;
  return ir;
}
function convolve(x, ir) {
  let n = 1; while (n < x.length + ir.length) n <<= 1;
  const xr = new Float64Array(n), xi = new Float64Array(n), hr = new Float64Array(n), hi = new Float64Array(n);
  xr.set(x); hr.set(ir);
  fft(xr, xi, false); fft(hr, hi, false);
  for (let i = 0; i < n; i++) {
    const a = xr[i] * hr[i] - xi[i] * hi[i], b = xr[i] * hi[i] + xi[i] * hr[i];
    xr[i] = a; xi[i] = b;
  }
  fft(xr, xi, true);
  return xr.subarray(0, x.length);
}
const wetL = convolve(sendL, makeIR(11)), wetR = convolve(sendR, makeIR(23));
const WET = 0.55;
const outL = new Float64Array(N), outR = new Float64Array(N);
for (let i = 0; i < N; i++) {
  // slight cross-feed of the wet for a wide but coherent room
  outL[i] = dryL[i] + WET * (wetL[i] * 0.85 + wetR[i] * 0.15);
  outR[i] = dryR[i] + WET * (wetR[i] * 0.85 + wetL[i] * 0.15);
}

// =====================================================================
// 8) Master: highpass, loudness normalize (BS.1770), limiter, fades, dither
// =====================================================================
function biquad(x, b, a) {
  const y = new Float64Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}
function hpCoefs(fc, q) {
  const w = TAU * fc / SR, al = Math.sin(w) / (2 * q), c = Math.cos(w), a0 = 1 + al;
  return [[(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0], [1, -2 * c / a0, (1 - al) / a0]];
}
{
  const [b, a] = hpCoefs(28, 0.707);
  const l = biquad(outL, b, a), r = biquad(outR, b, a);
  outL.set(l); outR.set(r);
}
function blockPowers(L, R) {
  const kb1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], ka1 = [1, -1.69065929318241, 0.73248077421585];
  const kb2 = [1, -2, 1], ka2 = [1, -1.99004745483398, 0.99007225036621];
  const l = biquad(biquad(L, kb1, ka1), kb2, ka2), r = biquad(biquad(R, kb1, ka1), kb2, ka2);
  const blk = SR * 0.4, hop = SR * 0.1, out = [];
  for (let s = 0; s + blk <= L.length; s += hop) {
    let z = 0;
    for (let i = s; i < s + blk; i++) z += l[i] * l[i] + r[i] * r[i];
    out.push(z / blk);
  }
  return out;
}
const lufsOf = (p) => -0.691 + 10 * Math.log10(p);
function integratedLUFS(L, R) {
  const p = blockPowers(L, R).filter((z) => lufsOf(z) > -70);
  const mean1 = p.reduce((a, b) => a + b, 0) / p.length;
  const rel = lufsOf(mean1) - 10;
  const g = p.filter((z) => lufsOf(z) > rel);
  return lufsOf(g.reduce((a, b) => a + b, 0) / g.length);
}
function limiter(L, R, ceilDb) {
  const ceil = Math.pow(10, ceilDb / 20), la = Math.floor(SR * 0.004), rel = 1 - Math.exp(-1 / (SR * 0.12));
  const need = new Float64Array(N);
  for (let i = 0; i < N; i++) { const pk = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = pk > ceil ? ceil / pk : 1; }
  // sliding minimum over the lookahead window, then smoothing
  const mn = new Float64Array(N);
  for (let i = 0; i < N; i++) { let v = 1; for (let j = i; j < Math.min(N, i + la); j++) if (need[j] < v) v = need[j]; mn[i] = v; }
  const g = new Float64Array(N);
  let cur = 1;
  for (let i = 0; i < N; i++) {
    // average of the window (keeps gain <= need at the peak), release smoothly
    let acc = 0, c = 0;
    for (let j = Math.max(0, i - la + 1); j <= i; j++) { acc += mn[j]; c++; }
    const target = Math.min(acc / c, mn[i]);
    cur = target < cur ? target : cur + (target - cur) * rel;
    g[i] = cur;
  }
  for (let i = 0; i < N; i++) { L[i] *= g[i]; R[i] *= g[i]; }
}
function peakDb(L, R) { let p = 0; for (let i = 0; i < N; i++) p = Math.max(p, Math.abs(L[i]), Math.abs(R[i])); return 20 * Math.log10(p); }

// fades: tiny fade-in at the very start, smooth fade to silence over the final 1.6 s
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let g = Math.min(1, t / 0.05);
  if (t > DUR - 1.6) g *= Math.pow(Math.cos(Math.PI / 2 * (t - (DUR - 1.6)) / 1.6), 2);
  outL[i] *= g; outR[i] *= g;
}

const TARGET = -16, CEIL = -2.3;
for (let pass = 0; pass < 4; pass++) {
  const lu = integratedLUFS(outL, outR);
  const gain = Math.pow(10, (TARGET - lu) / 20);
  for (let i = 0; i < N; i++) { outL[i] *= gain; outR[i] *= gain; }
  limiter(outL, outR, CEIL);
}
const finalLU = integratedLUFS(outL, outR);
console.log(`integrated ${finalLU.toFixed(2)} LUFS, sample peak ${peakDb(outL, outR).toFixed(2)} dBFS`);
// short-term loudness every 2 s (3 s window) as a structure check
{
  const p = blockPowers(outL, outR);
  const row = [];
  for (let t = 1; t < 48; t += 2) {
    const c = Math.round((t - 0.2) / 0.1), w = 15; let z = 0, k = 0;
    for (let j = Math.max(0, c - w); j < Math.min(p.length, c + w); j++) { z += p[j]; k++; }
    row.push(`${t}s:${lufsOf(z / k).toFixed(0)}`);
  }
  console.log('short-term LUFS:', row.join(' '));
}

// ---------- write WAV (16-bit PCM, TPDF dither) ----------
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8);
out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
const dr = mulberry32(7);
for (let i = 0; i < N; i++) {
  const d = () => (dr() - dr()) / 32768;
  out.writeInt16LE(clamp(Math.round((outL[i] + d()) * 32767), -32768, 32767), 44 + i * 4);
  out.writeInt16LE(clamp(Math.round((outR[i] + d()) * 32767), -32768, 32767), 46 + i * 4);
}
const file = path.join(__dirname, 'score.wav');
fs.writeFileSync(file, out);
console.log('wrote', file);
