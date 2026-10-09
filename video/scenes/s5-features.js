// s5 — "Made for real work". Four frosted-glass UI cards float in warm depth. The camera drifts slowly;
// focus racks from card to card (each card has a sharp and a pre-blurred face, mixed by distance from
// the focal plane) while each card's small UI comes alive: prompt lines type in, the audio plays,
// the score ring fills to 86, the language toggle slides to Arabic.
import { line } from '../lib/type.js';
import { clamp, lerp, range, ease, C } from '../lib/util.js';
import { drawCard, bokehCanvas, CW, CH, PARTS } from '../lib/s5-cards.js';
import { warmEnv, glowTexture } from '../lib/s4-gem.js';

const CARD_W = 3.3, CARD_H = CARD_W * CH / CW;
// When each card is the focal point (scene seconds): [start of focus pull, end of hold].
const FOCUS = [[0.4, 2.2], [2.2, 3.9], [3.9, 5.6], [5.6, 8]];

function band(g, y, h, alpha) {
  const grd = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  grd.addColorStop(0, 'rgba(8,5,3,0)'); grd.addColorStop(0.5, `rgba(8,5,3,${alpha})`); grd.addColorStop(1, 'rgba(8,5,3,0)');
  g.fillStyle = grd; g.fillRect(0, y - h / 2, 1920, h);
}

export default {
  id: 's5-features', duration: 8,
  bloom: { strength: 0.55, radius: 0.6, threshold: 0.82 },
  async setup({ THREE, renderer, lang, copy, rng }) {
    const ar = lang === 'ar';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0705');
    const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 80);
    const env = warmEnv(THREE, renderer);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const tex = (canvas, mip = true) => {
      const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
      t.generateMipmaps = mip; t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter; return t;
    };

    // ---- backdrop: deep warm space, a huge out-of-focus lattice glow far behind.
    const bdC = document.createElement('canvas'); bdC.width = 1024; bdC.height = 576;
    {
      const g = bdC.getContext('2d'); g.fillStyle = '#0b0705'; g.fillRect(0, 0, 1024, 576);
      const blob = (x, y, r, col) => { const grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grd; g.fillRect(0, 0, 1024, 576); };
      blob(700, 230, 420, 'rgba(242,150,58,0.36)'); blob(260, 380, 360, 'rgba(160,80,30,0.30)'); blob(860, 470, 260, 'rgba(63,179,167,0.07)'); blob(140, 120, 240, 'rgba(111,156,245,0.06)');
      // faint 8-point star lattice, heavily blurred
      g.filter = 'blur(6px)'; g.fillStyle = 'rgba(255,200,130,0.10)';
      for (let y = -20; y < 620; y += 64) for (let x = -20; x < 1080; x += 64) {
        g.beginPath(); for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + Math.PI / 16 + (i * Math.PI) / 8, rr = i % 2 ? 11 : 19; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } g.closePath(); g.fill();
      }
    }
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(64, 36), new THREE.MeshBasicMaterial({ map: tex(bdC), depthWrite: false }));
    backdrop.position.z = -20; scene.add(backdrop);

    // ---- bokeh: soft discs at many depths (out-of-focus lights), drifting slowly.
    const bokehTex = tex(bokehCanvas(), true);
    const r = rng(5), bokeh = [];
    const bcols = ['#ffb35c', '#ffcf8a', '#f2a33a', '#ffdcb0', '#3fbfb0', '#6f9cf5'];
    for (let i = 0; i < 34; i++) {
      const col = bcols[i < 31 ? Math.floor(r() * 4) : 4 + (i % 2)];
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokehTex, color: new THREE.Color(col), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.03 + r() * 0.08 }));
      const z = -3 - r() * 12, s = 0.25 + r() * 0.9 + (-z) * 0.05;
      m.scale.setScalar(s); scene.add(m);
      bokeh.push({ m, x: (r() - 0.5) * (14 - z * 1.0), y: (r() - 0.5) * (8 - z * 0.55), z, ph: r() * 6.28, sp: 0.04 + r() * 0.08 });
    }

    // ---- the four cards.
    const items = copy.s5.items;
    const kinds = ['prompt', 'audio', 'score', 'lang'];
    // Layout (world). Arabic mirrors left/right so the reading order still starts top-right.
    const LAY = [
      { p: [-2.25, 0.62, 0.25], ry: 0.16, rz: 0.012 },
      { p: [2.45, 0.78, -1.15], ry: -0.18, rz: -0.01 },
      { p: [-1.45, -1.4, -0.55], ry: 0.12, rz: -0.012 },
      { p: [2.0, -1.28, 0.55], ry: -0.14, rz: 0.01 },
    ];
    const glow = glowTexture(THREE);
    const cardVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    const cardFS = `uniform sampler2D mapA, mapB; uniform float mixv, bright, opacity; varying vec2 vUv;
      void main(){ vec4 a = texture2D(mapA, vUv), b = texture2D(mapB, vUv); vec4 c = mix(a, b, mixv);
        gl_FragColor = vec4(c.rgb * bright, c.a * opacity); }`;
    const local = (px, py) => [(px / CW - 0.5) * CARD_W, (0.5 - py / CH) * CARD_H];
    const slabShape = new THREE.Shape(); { const w = CARD_W / 2 - 0.02, h = CARD_H / 2 - 0.02, rr = 0.13;
      slabShape.moveTo(-w + rr, -h); slabShape.lineTo(w - rr, -h); slabShape.quadraticCurveTo(w, -h, w, -h + rr); slabShape.lineTo(w, h - rr); slabShape.quadraticCurveTo(w, h, w - rr, h);
      slabShape.lineTo(-w + rr, h); slabShape.quadraticCurveTo(-w, h, -w, h - rr); slabShape.lineTo(-w, -h + rr); slabShape.quadraticCurveTo(-w, -h, -w + rr, -h); }
    const slabGeo = new THREE.ExtrudeGeometry(slabShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 6 });
    slabGeo.translate(0, 0, -0.06);
    const slabMat = new THREE.MeshPhysicalMaterial({ color: '#ffd9b0', roughness: 0.22, metalness: 0, envMap: env, envMapIntensity: 0.9, transparent: true, opacity: 0.14, depthWrite: false });
    const faceGeo = new THREE.PlaneGeometry(CARD_W, CARD_H);

    const cards = kinds.map((kind, i) => {
      const d = drawCard(kind, items[i], ar, rng(100 + i), { buttons: ['ChatGPT', 'Claude'] });
      const L = LAY[i], grp = new THREE.Group();
      grp.position.set(ar ? -L.p[0] : L.p[0], L.p[1], L.p[2]);
      grp.rotation.set(0, ar ? -L.ry : L.ry, ar ? -L.rz : L.rz);
      scene.add(grp);
      const back = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: new THREE.Color('#ff9a40'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.18 }));
      back.scale.set(CARD_W * 1.9, CARD_H * 2.2, 1); back.position.z = -0.5; back.renderOrder = 1; grp.add(back);
      const slab = new THREE.Mesh(slabGeo, slabMat); slab.renderOrder = 2; grp.add(slab);
      const faceMat = new THREE.ShaderMaterial({ uniforms: { mapA: { value: tex(d.canvas) }, mapB: { value: tex(d.blur) }, mixv: { value: 0 }, bright: { value: 1 }, opacity: { value: 1 } },
        vertexShader: cardVS, fragmentShader: cardFS, transparent: true, depthWrite: false });
      const face = new THREE.Mesh(faceGeo, faceMat); face.position.z = 0.002; face.renderOrder = 3; grp.add(face);
      const ov = [];
      const add = (mesh, ro = 4) => { mesh.renderOrder = ro; mesh.position.z = 0.004 + 0.001 * ro; grp.add(mesh); ov.push(mesh); return mesh; };
      const C2 = { grp, face, faceMat, back, ov, kind, a: d.anchors, i };

      if (kind === 'prompt') {
        C2.bars = d.anchors.rows.map((rw, j) => {
          const m = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(PARTS[j]).multiplyScalar(0.9), transparent: true, opacity: 0.85, depthWrite: false })));
          m.userData = rw; return m;
        });
        const b = d.anchors.b1;
        C2.btnGlow = add(new THREE.Mesh(new THREE.PlaneGeometry(b.w / CW * CARD_W * 1.5, b.h / CH * CARD_H * 2.2), new THREE.MeshBasicMaterial({ map: glow, color: new THREE.Color('#ffb85c'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })));
        const [bx, by] = local(b.x, b.y); C2.btnGlow.position.x = bx; C2.btnGlow.position.y = by;
      }
      if (kind === 'audio') {
        const w = d.anchors.wave, wt = tex(w.played);
        wt.wrapS = THREE.ClampToEdgeWrapping;
        // a plane covering the wave strip; its UVs are cropped to the strip, then revealed by scaling
        const x0 = ar ? CW - w.x1 : w.x0, x1 = ar ? CW - w.x0 : w.x1, y0 = w.cy - w.h / 2, y1 = w.cy + w.h / 2 + 30;
        const geo = new THREE.PlaneGeometry(1, 1);
        const mat = new THREE.MeshBasicMaterial({ map: wt, transparent: true, depthWrite: false });
        C2.played = add(new THREE.Mesh(geo, mat));
        C2.playedBox = { x0, x1, y0, y1 };
      }
      if (kind === 'score') {
        const R = d.anchors.ring, segs = 160;
        const rg = new THREE.RingGeometry((R.R - R.w / 2) / CW * CARD_W, (R.R + R.w / 2) / CW * CARD_W, segs, 1, Math.PI / 2, Math.PI * 2);
        const ring = add(new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb44d'), transparent: true, depthWrite: false, side: THREE.DoubleSide })));
        ring.scale.x = -1; // clockwise from 12 o'clock
        const [rx, ry] = local(R.cx, R.cy); ring.position.x = rx; ring.position.y = ry;
        C2.ring = ring; C2.segs = segs;
        // number: small canvas, redrawn only when the value changes
        const nc = document.createElement('canvas'); nc.width = 512; nc.height = 256;
        const nt = tex(nc, false);
        const num = add(new THREE.Mesh(new THREE.PlaneGeometry(512 * CARD_W / CW, 256 * CARD_W / CW), new THREE.MeshBasicMaterial({ map: nt, transparent: true, depthWrite: false })), 5);
        num.position.x = rx; num.position.y = ry + 0.035;
        C2.num = { canvas: nc, tex: nt, last: -1 };
        C2.subs = d.anchors.subs.map((s, j) => {
          const m = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(PARTS[j]).multiplyScalar(0.95), transparent: true, opacity: 0.9, depthWrite: false })));
          m.userData = s; return m;
        });
      }
      if (kind === 'lang') {
        const tg = d.anchors.toggle;
        const kc = document.createElement('canvas'); kc.width = 512; kc.height = 256;
        { const g = kc.getContext('2d'); g.beginPath(); g.roundRect(8, 8, 496, 240, 120); const f = g.createLinearGradient(0, 0, 0, 256); f.addColorStop(0, '#ffc46e'); f.addColorStop(1, '#e48a2a'); g.fillStyle = f; g.fill(); }
        const kw = (tg.w / 2 - 20) / CW * CARD_W, kh = (tg.h - 28) / CH * CARD_H;
        C2.knob = add(new THREE.Mesh(new THREE.PlaneGeometry(kw, kh), new THREE.MeshBasicMaterial({ map: tex(kc), transparent: true, depthWrite: false })), 4);
        C2.knobY = local(0, tg.y + tg.h / 2)[1];
        C2.knobX = [local(tg.x + tg.w * 0.25, 0)[0], local(tg.x + tg.w * 0.75, 0)[0]];
        C2.labels = add(new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: tex(d.anchors.labels), transparent: true, depthWrite: false })), 6);
        const dt = tex(d.anchors.labelsDark);
        C2.dark = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: dt, transparent: true, depthWrite: false })), 7);
        C2.knobPx = { w: tg.w / 2 - 20, h: tg.h - 28, cy: tg.y + tg.h / 2, xs: [tg.x + tg.w * 0.25, tg.x + tg.w * 0.75] };
      }
      return C2;
    });
    // Back-to-front draw order between cards (their depth order never changes).
    const depthOrder = [...cards].sort((a, b) => a.grp.position.z - b.grp.position.z);
    depthOrder.forEach((c, n) => c.grp.traverse(o => { o.renderOrder += n * 10; }));

    const focusIdx = t => { for (let i = FOCUS.length - 1; i >= 0; i--) if (t >= FOCUS[i][0]) return i; return 0; };
    const focusZ = t => {
      let z = cards[0].grp.position.z;
      for (let i = 1; i < 4; i++) z = lerp(z, cards[i].grp.position.z, ease.inOut(range(t, FOCUS[i][0] - 0.25, FOCUS[i][0] + 0.45)));
      return z;
    };
    const setStrip = (m, x0, y0, w, h, px, py, frac, rtl) => {
      // a plane covering canvas rect [x0..x0+w]x[y0..y0+h], filled frac of the way in reading direction
      const ww = Math.max(1e-4, frac) * w;
      const cx = rtl ? x0 + w - ww / 2 : x0 + ww / 2;
      const [lx, ly] = local(cx, y0 + h / 2);
      m.scale.set(ww / CW * CARD_W, h / CH * CARD_H, 1); m.position.x = lx; m.position.y = ly;
      m.visible = frac > 0.001;
    };

    return {
      scene, camera,
      update(t) {
        const k = t / 8, cp = ease.inOut(k);
        const dir = ar ? -1 : 1;
        camera.position.set(dir * lerp(-0.75, 0.75, cp), lerp(0.35, -0.1, cp), lerp(11.2, 10.1, cp));
        camera.lookAt(dir * lerp(-0.3, 0.3, cp), lerp(0.0, -0.12, cp), 0);

        const fz = focusZ(t), fi = focusIdx(t);
        for (const c of cards) {
          const L = LAY[c.i];
          const bob = Math.sin(t * 0.7 + c.i * 1.7) * 0.05;
          const isF = c.i === fi ? ease.inOut(range(t, FOCUS[c.i][0] - 0.2, FOCUS[c.i][0] + 0.5)) * (1 - ease.inOut(range(t, FOCUS[c.i][1] - 0.1, FOCUS[c.i][1] + 0.5))) : 0;
          const lift = c.i === fi || (c.i === 3 && t > 5.4) ? isF : 0;
          c.grp.position.y = L.p[1] + bob;
          c.grp.position.z = L.p[2] + 0.18 * lift;
          c.grp.rotation.x = Math.sin(t * 0.5 + c.i) * 0.025;
          const blur = clamp(Math.abs(c.grp.position.z - fz) / 1.1);
          c.faceMat.uniforms.mixv.value = ease.out(blur) * 0.92;
          c.faceMat.uniforms.bright.value = 0.72 + 0.4 * (1 - blur);
          c.back.material.opacity = 0.1 + 0.16 * (1 - blur);
          const ovA = 1 - 0.85 * blur;
          c.ov.forEach(m => { if (m.material.opacity !== undefined && m !== c.btnGlow) m.material.opacity = (m.userData.baseOp ??= m.material.opacity) * ovA; });
        }
        // Card animations (each starts as its card comes into focus).
        const A = cards[0];
        A.bars.forEach((m, j) => { const u = m.userData; setStrip(m, ar ? CW - u.x - u.w : u.x, u.y - u.h / 2, u.w, u.h, 0, 0, ease.out(range(t, 0.7 + j * 0.32, 1.2 + j * 0.32)), ar); });
        A.btnGlow.material.opacity = 0.75 * Math.exp(-Math.max(0, t - 2.15) * 2.2) * range(t, 1.95, 2.15);
        const B = cards[1], pb = B.playedBox, prog = lerp(0.16, 0.88, range(t, 2.0, 7.8));
        // reveal the amber wave: crop UVs to the revealed part of the strip
        {
          const m = B.played, w = pb.x1 - pb.x0, ww = w * prog, h = pb.y1 - pb.y0;
          const sx0 = ar ? pb.x1 - ww : pb.x0;
          const [lx, ly] = local(sx0 + ww / 2, pb.y0 + h / 2);
          m.scale.set(ww / CW * CARD_W, h / CH * CARD_H, 1); m.position.x = lx; m.position.y = ly;
          const mt = m.material.map; mt.repeat.set(ww / CW, h / CH); mt.offset.set(sx0 / CW, 1 - pb.y1 / CH);
        }
        const Cc = cards[2], sp = ease.inOut(range(t, 3.95, 5.2)), val = Math.round(86 * sp);
        Cc.ring.geometry.setDrawRange(0, Math.round(Cc.segs * 0.86 * sp) * 6);
        Cc.ring.visible = sp > 0.001;
        Cc.subs.forEach((m, j) => { const u = m.userData; setStrip(m, ar ? CW - u.x - u.w : u.x, u.y - u.h / 2, u.w, u.h, 0, 0, ease.out(range(t, 4.2 + j * 0.15, 5.0 + j * 0.15)), ar); });
        if (val !== Cc.num.last) {
          const g = Cc.num.canvas.getContext('2d'); g.clearRect(0, 0, 512, 256);
          g.font = '600 168px Messiri'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'ltr'; g.fillStyle = '#ffe2b8';
          g.fillText(String(val), 256, 118); Cc.num.tex.needsUpdate = true; Cc.num.last = val;
        }
        const D = cards[3], kp = ease.inOut(range(t, 6.1, 6.75));
        D.knob.position.x = lerp(D.knobX[0], D.knobX[1], kp); D.knob.position.y = D.knobY;
        D.knob.scale.x = 1 + 0.12 * Math.sin(kp * Math.PI);
        {
          const P = D.knobPx, w = P.w * D.knob.scale.x, cx = lerp(P.xs[0], P.xs[1], kp);
          const m = D.dark, [lx, ly] = local(cx, P.cy);
          m.scale.set(w * CARD_W / CW, P.h * CARD_W / CW, 1); m.position.x = lx; m.position.y = ly;
          m.material.map.repeat.set(w / CW, P.h / CH); m.material.map.offset.set((cx - w / 2) / CW, 1 - (P.cy + P.h / 2) / CH);
        }

        for (const b of bokeh) {
          b.m.position.set(b.x + Math.sin(t * b.sp * 3 + b.ph) * 0.25, b.y + t * b.sp, b.z);
        }
        return { vignette: 0.95 };
      },
      overlay(g, t) {
        band(g, 128, 220, 0.55 * range(t, 0.1, 0.8));
        line(g, { text: copy.s5.h, x: 960, y: 150, size: 74, color: C.cream, t, in: 0.25, dur: 1.1, glow: 20, glowColor: 'rgba(255,190,110,0.35)' });
      },
    };
  },
};
