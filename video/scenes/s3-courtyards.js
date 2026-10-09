// Scene 3 — The courtyard. We glide in under a lattice transom into a dark courtyard; three tall
// arch windows, each with its own lattice and colour of light (AI amber, Finance teal, M365 blue),
// pour patterned shafts onto the stone floor. The camera tracks past each one in turn, and each
// window wakes up as we arrive, with its track name beside it.
import { line } from '../lib/type.js';
import { range, ease, C } from '../lib/util.js';
import { archOutline, archLattice, latticeMask, lightShafts, lightPool, backplate, motes, curve, fitSize, softScrim } from '../lib/s3-light.js';

const KINDS = [
  { kind: 'ai', color: C.amber, hot: C.amberHot, tileW: 0.34, gain: 0.78 },
  { kind: 'finance', color: C.teal, hot: C.tealHot, tileW: 0.40, gain: 1 },
  { kind: 'm365', color: C.blue, hot: C.blueHot, tileW: 0.36, gain: 1.05 },
];
const L = 10;                           // distance between windows
const WW = 2.4, WH = 5.2, SILL = 0.85;  // window opening
const ZW = -0.26;                       // lattice plane
const DX = 0.35, DZ = 0.62;              // light direction per unit of drop
const FOCUS = [3.6, 6.0, 8.4];          // when the camera is with window i
const OFF = 2.6;                      // window sits right of centre (left of centre in Arabic)

export default {
  id: 's3-courtyards', duration: 10, fadeIn: 0.5, fadeOut: 0.5,
  bloom: { strength: 0.85, radius: 0.55, threshold: 0.6 },
  async setup({ THREE, lang, rng, copy }) {
    const m = lang === 'ar' ? -1 : 1;
    const rand = rng(303);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070403');
    scene.fog = new THREE.FogExp2('#0a0604', 0.028);
    const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 80);

    // ---- Materials
    const stoneTex = (() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const g = cv.getContext('2d');
      const n = 8, s = 1024 / n;
      g.fillStyle = '#120c08'; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const v = 0.78 + rand() * 0.3;
        g.fillStyle = `rgb(${Math.round(74 * v)},${Math.round(56 * v)},${Math.round(42 * v)})`; g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
        for (let q = 0; q < 50; q++) { g.fillStyle = `rgba(0,0,0,${rand() * 0.07})`; g.beginPath(); g.arc(i * s + rand() * s, j * s + rand() * s, 2 + rand() * 18, 0, 7); g.fill(); }
      }
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(9, 9);
      return t;
    })();
    const floorMat = new THREE.MeshStandardMaterial({ map: stoneTex, color: '#8a7462', roughness: 0.55, metalness: 0.0 });
    const wallMat = new THREE.MeshStandardMaterial({ color: '#4a3527', roughness: 0.92 });
    const trimMat = new THREE.MeshStandardMaterial({ color: '#3b291d', roughness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.7 });
    const darkMat = new THREE.MeshStandardMaterial({ color: '#130c08', roughness: 0.95 });

    // ---- Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 10); scene.add(floor);

    // ---- Back wall with three arch openings
    const xs = [-L, 0, L].map(x => x * m);
    const V2 = ([x, y]) => new THREE.Vector2(x, y);
    const wallShape = new THREE.Shape([[-26, 0], [26, 0], [26, 14], [-26, 14]].map(V2));
    for (const x of xs) wallShape.holes.push(new THREE.Path(archOutline(WW, WH).map(([px, py]) => V2([px + x, py + SILL]))));
    const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(wallShape, { depth: 0.5, bevelEnabled: false, curveSegments: 4 }), wallMat);
    wall.position.z = -0.5; scene.add(wall);
    // Pilasters, plinth, string course, and a moulding round each arch.
    for (let i = -3; i <= 2; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 0.36), trimMat); p.position.set((i + 0.5) * L, 7, 0.18); scene.add(p);
    }
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(52, 0.42, 0.5), trimMat); plinth.position.set(0, 0.21, 0.25); scene.add(plinth);
    const course = new THREE.Mesh(new THREE.BoxGeometry(52, 0.22, 0.28), trimMat); course.position.set(0, SILL + WH + 0.9, 0.14); scene.add(course);
    for (const x of xs) {
      const ring = new THREE.Shape(archOutline(WW + 0.5, WH + 0.25).map(([px, py]) => V2([px, py - 0.25])));
      ring.holes.push(new THREE.Path(archOutline(WW, WH).map(V2)));
      const rg = new THREE.Mesh(new THREE.ExtrudeGeometry(ring, { depth: 0.1, bevelEnabled: false, curveSegments: 4 }), trimMat);
      rg.position.set(x, SILL, 0); scene.add(rg);
      const sill = new THREE.Mesh(new THREE.BoxGeometry(WW + 0.9, 0.14, 0.42), trimMat); sill.position.set(x, SILL - 0.07, 0.12); scene.add(sill);
    }
    // Back of the rooms behind the windows.
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 16), darkMat); backWall.position.set(0, 7, -2.2); scene.add(backWall);

    // ---- Windows: lattice, glowing room light, light shafts, floor pools, motes, lights
    const wins = KINDS.map((K, i) => {
      const x = xs[i];
      const lat = archLattice(THREE, K.kind, WW, WH, K.tileW, { inset: 0.06, grow: 0.12 });
      const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(lat.shape, { depth: 0.07, bevelEnabled: false, curveSegments: 3 }), woodMat);
      mesh.position.set(x, SILL, ZW - 0.07); scene.add(mesh);
      if (lat.solids.length) {
        const sm = new THREE.Mesh(new THREE.ExtrudeGeometry(lat.solids, { depth: 0.07, bevelEnabled: false }), woodMat);
        sm.position.copy(mesh.position); scene.add(sm);
      }
      const sharp = latticeMask(THREE, lat, WW, WH, { px: 512, blur: 1.2 });
      const soft = latticeMask(THREE, lat, WW, WH, { px: 256, blur: 4 });
      const mid = latticeMask(THREE, lat, WW, WH, { px: 512, blur: 2.2 });
      const bp = backplate(THREE, { color: K.color, w: WW + 1.0, h: WH + 0.8, top: 1.9, bottom: 0.75 });
      bp.mesh.position.set(x, SILL + WH / 2, -1.0); scene.add(bp.mesh);
      const geom = { cx: x, y0: SILL, w: WW, H: WH, zw: ZW, dx: DX * m, dz: DZ };
      const sh = lightShafts(THREE, { mask: mid, color: K.color, N: 26, ...geom }); scene.add(sh.mesh);
      const pool = lightPool(THREE, { sharp, soft, color: K.color, ...geom }); scene.add(pool.mesh);
      const mo = motes(THREE, { rand, n: 160, mask: soft, color: K.hot, size: 0.045, ...geom }); scene.add(mo.points);
      const spill = new THREE.PointLight(K.color, 0, 14, 2); spill.position.set(x + DX * m * 2, 2.6, 2.8); scene.add(spill);
      return { x, sh, pool, mo, bp, spill, K };
    });
    scene.add(new THREE.HemisphereLight('#5a4030', '#0b0705', 0.9));

    // ---- Camera path (monotone curves, so no overshoot) and the entrance doorway with a lattice transom.
    const camX = curve([[0, -L - OFF - 0.9], [FOCUS[0], -L - OFF], [FOCUS[1], -OFF], [FOCUS[2], L - OFF], [10, L - OFF + 2.6]].map(([t, v]) => [t, v * m]));
    const camY = curve([[0, 2.0], [1.9, 2.9], [FOCUS[0], 5.1], [FOCUS[1], 5.25], [FOCUS[2], 5.25], [10, 5.5]]);
    const camZ = curve([[0, 23.6], [1.9, 17.6], [FOCUS[0], 14.3], [FOCUS[1], 13.9], [FOCUS[2], 13.9], [10, 14.7]]);
    const lookY = curve([[0, 2.9], [1.9, 2.5], [FOCUS[0], 2.05], [10, 2.0]]);
    const ZD = 18.6, DW = 3.6, DH = 6.0, DCUT = 3.5;
    const dX = camX(1.75);
    {
      const s = new THREE.Shape([[-30, 0], [30, 0], [30, 16], [-30, 16]].map(V2));
      s.holes.push(new THREE.Path(archOutline(DW, DH).map(([px, py]) => V2([px + dX, py]))));
      const dw = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: false, curveSegments: 4 }), trimMat);
      dw.position.z = ZD - 0.9; scene.add(dw);
      const tl = archLattice(THREE, 'ai', DW, DH, 0.36, { inset: 0.05, grow: 0.1, yCut: DCUT });
      const tm = new THREE.Mesh(new THREE.ExtrudeGeometry(tl.shape, { depth: 0.08, bevelEnabled: false, curveSegments: 3 }), woodMat);
      tm.position.set(dX, 0, ZD - 0.45); scene.add(tm);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(DW + 0.2, 0.16, 0.2), woodMat); bar.position.set(dX, DCUT, ZD - 0.42); scene.add(bar);
    }
    const doorLight = new THREE.PointLight('#f2a33a', 40, 8, 2); doorLight.position.set(dX + 0.8 * m, 3.2, ZD - 2.4); scene.add(doorLight);
    const doorFront = new THREE.PointLight('#c98a4a', 22, 9, 2); doorFront.position.set(dX - 2.2 * m, 5.0, ZD + 2.6); scene.add(doorFront);

    // Window i wakes up as the camera arrives, then settles back to an ember once we have moved on.
    const level = (i, t) => {
      const up = ease.inOut(range(t, FOCUS[i] - 2.3, FOCUS[i] - 0.2));
      const down = i === 2 ? 0 : ease.inOut(range(t, FOCUS[i] + 0.8, FOCUS[i] + 2.2));
      return 0.28 + 0.72 * up * (1 - 0.6 * down);
    };
    const look = new THREE.Vector3();

    return {
      scene, camera,
      update(t) {
        camera.position.set(camX(t), camY(t), camZ(t));
        look.set(camX(t) + 0.35 * m, lookY(t), 0);
        camera.lookAt(look);
        wins.forEach((w, i) => {
          const b = level(i, t) * w.K.gain, breath = 1 + 0.035 * Math.sin(t * 1.7 + i * 2);
          w.bp.mat.uniforms.amp.value = b * breath;
          w.sh.mat.uniforms.amp.value = 0.05 * b * breath; w.sh.mat.uniforms.time.value = t;
          w.pool.mat.uniforms.amp.value = 1.6 * b * breath;
          w.mo.mat.uniforms.amp.value = 1.6 * b; w.mo.mat.uniforms.time.value = t;
          w.spill.intensity = 18 * b;
        });
        doorLight.intensity = 40 * (1 - range(t, 1.4, 3)); doorFront.intensity = 22 * (1 - range(t, 1.0, 2.4));
        return { bloom: { strength: 0.8 + 0.12 * level(0, t), radius: 0.55, threshold: 0.6 }, vignette: 0.95 };
      },
      overlay(g, t) {
        // Kicker, centred low while we pass the doorway.
        const kick = copy.s3.kicker;
        const ks = fitSize(g, kick, { size: 64, maxW: 1500 });
        softScrim(g, { x: 960, y: 905, rx: 900, ry: 120, alpha: 0.55 * range(t, 0.3, 1.0) * (1 - range(t, 2.6, 3.3)) });
        line(g, { text: kick, x: 960, y: 925, size: ks, t, in: 0.35, out: 2.6, dur: 1.0, color: C.cream, letter: 1 });
        // Track labels: accent rule, name (big), lesson count (small), on the side away from the window.
        const rtl = m < 0, x = rtl ? 1770 : 150, align = rtl ? 'right' : 'left';
        copy.s3.tracks.forEach(([name, count], i) => {
          const tin = FOCUS[i] - 0.7, tout = i === 2 ? null : FOCUS[i] + 1.45;
          const vis = range(t, tin, tin + 0.6) * (tout == null ? 1 : 1 - range(t, tout, tout + 0.6));
          if (vis <= 0) return;
          const K = KINDS[i];
          const ns = fitSize(g, name, { size: 92, maxW: 760 });
          softScrim(g, { x: rtl ? 1420 : 500, y: 700, rx: 560, ry: 230, alpha: 0.62 * vis });
          const kr = ease.out(range(t, tin, tin + 0.9)) * (tout == null ? 1 : 1 - range(t, tout, tout + 0.5));
          if (kr > 0) {
            g.save(); g.globalAlpha = kr; g.fillStyle = K.color;
            const len = 72 * kr; g.fillRect(rtl ? x - len : x, 610, len, 4); g.restore();
          }
          const ny = 610 + 28 + ns * 0.95;
          line(g, { text: name, x, y: ny, size: ns, t, in: tin + 0.1, out: tout, dur: 1.0, align, color: C.cream });
          line(g, { text: count, x, y: ny + 66, size: 42, font: 'body', weight: 400, t, in: tin + 0.35, out: tout, dur: 0.9, align, color: K.hot, letter: 1 });
        });
      },
    };
  },
};
