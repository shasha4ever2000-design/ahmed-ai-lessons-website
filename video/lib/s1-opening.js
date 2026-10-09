// Shared build for the opening (s1-noise + s2-mashrabiya). Both scenes use the SAME shards,
// computed from one global opening time T (s1: T = t, s2: T = 6 + t), so the cut is continuous.
import { panelShape } from './patterns.js';
import { clamp, ease, range } from './util.js';

// The panel: an 8-point-star lattice standing in a deep window in a dark wall.
export const PANEL = { cols: 6, rows: 8, scale: 0.01, cy: 2.95, depth: 0.14 };
// The sun, high behind the wall (only felt through the holes).
export const SUN = { x: 1.5, y: 12, z: -4.5 };
// Reveal timing of the panel in s2 seconds (centre first, edges last).
export const REVEAL = { t0: 2.1, span: 2.5, noise: 0.35 };
// The volume the noise lives in (s1).
const BOX = { c: [0, 3.0, 2.0], s: [20, 10, 14] };

export const hash = (a, b = 0) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };

/** Panel outline and hole polygons in panel-local units (centred, y up). */
export function panelData(THREE) {
  const shape = panelShape(THREE, 'ai', PANEL.cols, PANEL.rows, PANEL.scale);
  const outline = shape.getPoints();
  let hw = 0, hh = 0; outline.forEach(p => { hw = Math.max(hw, Math.abs(p.x)); hh = Math.max(hh, Math.abs(p.y)); });
  const holes = shape.holes.map(h => h.getPoints().map(p => [p.x, p.y]));
  return { shape, hw, hh, holes };
}
const inPoly = (x, y, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };

/** When (s2 seconds) the wood at panel-local (x,y) materialises. Same formula as the panel shader. */
export function revealAt(x, y, hw, hh) {
  const r = Math.hypot(x / hw, y / hh) / Math.SQRT2;
  const n = Math.sin(x * 7.3 + y * 3.1) * Math.sin(x * 2.7 - y * 6.9);
  return REVEAL.t0 + REVEAL.span * r + REVEAL.noise * n;
}
export const revealGLSL = (hw, hh) => `
float revealAt(vec2 p){ float r = length(p / vec2(${hw.toFixed(5)}, ${hh.toFixed(5)})) / 1.41421356;
  float n = sin(p.x*7.3 + p.y*3.1) * sin(p.x*2.7 - p.y*6.9);
  return ${REVEAL.t0.toFixed(3)} + ${REVEAL.span.toFixed(3)} * r + ${REVEAL.noise.toFixed(3)} * n; }`;

/** Where a ray from the sun through (x,y,z) hits the floor (y = 0). */
export function toFloor(x, y, z) {
  const s = SUN.y / (SUN.y - y);
  return [SUN.x + s * (x - SUN.x), 0, SUN.z + s * (z - SUN.z)];
}

/**
 * The shards: thin cold slivers that become warm embers and land on the panel.
 * Returns { mesh, update(T, cam) } where T is opening time (0..14).
 */
export function makeShards(THREE, rng, pd, { count = 720 } = {}) {
  const r = rng(7331);
  const geo = new THREE.BufferGeometry();
  // A thin, slightly bent sliver (two triangles) so it glints as it turns.
  geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.5, 0, -0.18, -0.5, 0.04, 0.2, -0.42, -0.04, 0, 0.5, 0, 0.2, -0.42, -0.04, 0.05, -0.1, 0.06], 3));
  geo.computeVertexNormals();
  const aCol = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  aCol.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aCol', aCol);
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { uCam: { value: new THREE.Vector3() }, uL: { value: new THREE.Vector3(0, 6, 6) }, uLc: { value: new THREE.Color(1, 1, 1) }, uAmb: { value: 0.06 }, uFog: { value: 0.08 } },
    vertexShader: `attribute vec3 aCol; varying vec3 vN; varying vec3 vW; varying vec3 vG;
      void main(){ mat4 m = modelMatrix * instanceMatrix; vec4 w = m * vec4(position, 1.0);
        vW = w.xyz; vN = normalize(mat3(m) * normal); vG = aCol; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uCam, uL, uLc; uniform float uAmb, uFog; varying vec3 vN; varying vec3 vW; varying vec3 vG;
      void main(){ vec3 n = normalize(vN); vec3 v = normalize(uCam - vW); if (dot(n, v) < 0.0) n = -n;
        vec3 l = normalize(uL - vW); float diff = max(dot(n, l), 0.0);
        float spec = pow(max(dot(n, normalize(l + v)), 0.0), 36.0);
        vec3 base = mix(vec3(0.80, 0.88, 1.0), vec3(1.0, 0.56, 0.20), vG.y);
        vec3 c = base * (uAmb + diff * 0.55) * uLc + uLc * mix(vec3(1.0), vec3(1.0, 0.75, 0.45), vG.y) * spec * 3.0 + base * vG.x;
        float d = length(uCam - vW); c *= exp(-uFog * max(d - 7.0, 0.0)) * vG.z;
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  // Per-shard constants.
  const S = [];
  const tz = PANEL.depth / 2 + 0.03;
  for (let i = 0; i < count; i++) {
    const p0 = BOX.c.map((c, k) => c + (r() - 0.5) * BOX.s[k]);
    const sp = 1.2 + r() * 2.6, dir = [(r() - 0.5) * 2, (r() - 0.5) * 0.7, (r() - 0.5) * 1.2];
    const dl = Math.hypot(...dir) || 1; const v = dir.map(d => (d / dl) * sp);
    const axis = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    const size = 0.07 + Math.pow(r(), 1.8) * 0.34, stretch = 0.6 + r() * 1.4;
    const dust = r() < 0.26;
    let tx, ty;
    for (let k = 0; k < 60; k++) { tx = (r() - 0.5) * 2 * (pd.hw - 0.02); ty = (r() - 0.5) * 2 * (pd.hh - 0.02); if (!pd.holes.some(h => inPoly(tx, ty, h))) break; }
    const arrive = revealAt(tx, ty, pd.hw, pd.hh) + 0.05;
    const fly = 1.3 + r() * 0.9;
    const dustTo = [(r() - 0.5) * 4.5, 0.4 + r() * 4.4, 0.4 + r() * 3.6];
    S.push({ p0, v, axis, w: (r() - 0.5) * 9, ph: r() * 6.28, size, stretch, dust, target: [tx, PANEL.cy + ty, tz], arrive, fly, dustTo, fl: r(), arcY: 0.6 + r() * 1.4, dw: (r() - 0.5) * 0.6 });
  }

  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), P = new THREE.Vector3(), SC = new THREE.Vector3();
  const QFLAT = new THREE.Quaternion();
  const wrapK = (x, k) => Math.floor((x - BOX.c[k] + BOX.s[k] / 2) / BOX.s[k]);
  const edgeFade = p => { let f = 1; for (let k = 0; k < 3; k++) { const d = BOX.s[k] / 2 - Math.abs(p[k] - BOX.c[k]); f *= clamp(d / 1.2); } return f; };

  function update(T, camPos) {
    mat.uniforms.uCam.value.copy(camPos);
    const inS2 = T > 6, t2 = T - 6;
    // Chaos time: runs 1:1 in s1, then decays smoothly (same speed at the cut) in s2.
    const tau = inS2 ? 6 + 1.5 * (1 - Math.exp(-t2 / 1.5)) : T;
    const frame = Math.floor(T * 15);
    const glitchAmt = inS2 ? 1 - range(t2, 0, 1.2) : 0.6 + 0.4 * range(T, 3.5, 6);
    const warmG = inS2 ? ease.inOut(range(t2, 0.6, 3.2)) : 0;
    for (let i = 0; i < count; i++) {
      const s = S[i];
      const raw = s.p0.map((p, k) => p + s.v[k] * tau);
      let pos;
      if (!inS2) pos = raw.map((x, k) => x - wrapK(x, k) * BOX.s[k]);
      else { const at6 = s.p0.map((p, k) => p + s.v[k] * 6); pos = raw.map((x, k) => x - wrapK(at6[k], k) * BOX.s[k]); }
      const fade = edgeFade(pos);
      // Glitch: a shard jumps sideways for one frame now and then.
      if (hash(i, frame) > 0.965) pos[0] += (hash(i + 0.5, frame) - 0.5) * 1.6 * glitchAmt;
      Q.setFromAxisAngle(s.axis, s.ph + s.w * tau);
      let scale = s.size * fade, glow = 0, warm = warmG, vis = 1;
      // Cold flicker: a few shards spike each frame.
      const fl = hash(i * 1.7, frame);
      glow = (fl > 0.93 ? 2.2 : 0.05) * (inS2 ? 1 - range(t2, 0, 2) : 1);
      if (!inS2) glow += 0.12 * range(T, 4.2, 6);
      if (inS2) {
        if (!s.dust) {
          const b = ease.inOut(range(t2, s.arrive - s.fly, s.arrive));
          const arc = Math.sin(b * Math.PI) * s.arcY;
          P.set(pos[0] + (s.target[0] - pos[0]) * b, pos[1] + (s.target[1] - pos[1]) * b + arc * (1 - b) * 0.6, pos[2] + (s.target[2] - pos[2]) * b);
          pos = [P.x, P.y, P.z];
          scale = s.size * (fade + (1 - fade) * range(b, 0, 0.4));
          Q2.copy(Q).slerp(QFLAT, ease.out(range(b, 0.3, 1)));
          Q.copy(Q2);
          const land = range(t2, s.arrive - 0.06, s.arrive + 0.4);
          glow += (0.25 + 0.9 * b) * warmG + (t2 > s.arrive - 0.06 ? 3.5 * (1 - land) : 0);
          scale *= 1 - ease.in(land) * 0.9;
          if (land >= 1) vis = 0;
          warm = Math.max(warm, b);
        } else {
          // The noise that doesn't become wood settles as warm dust in the light.
          const b = ease.inOut(range(t2, 0.8, 6.5));
          const drift = [Math.sin(t2 * 0.4 + s.ph) * 0.15, -t2 * 0.04 + Math.sin(t2 * 0.3 + s.ph * 2) * 0.1, Math.cos(t2 * 0.35 + s.ph) * 0.12];
          pos = pos.map((p, k) => p + (s.dustTo[k] + drift[k] - p) * b);
          scale = s.size * (fade + (1 - fade) * b) * (1 - 0.82 * b);
          glow += 0.6 * b * (0.6 + 0.4 * Math.sin(t2 * 1.3 + s.ph * 3));
        }
      }
      SC.set(scale * 0.5, scale * s.stretch, scale);
      M.compose(P.set(pos[0], pos[1], pos[2]), Q, vis ? SC : SC.set(0, 0, 0));
      mesh.setMatrixAt(i, M);
      aCol.setXYZ(i, glow, warm, 1);
    }
    mesh.instanceMatrix.needsUpdate = true; aCol.needsUpdate = true;
  }
  return { mesh, update, material: mat };
}

/** The opening's camera, one continuous path over T (0..14). */
export function camAt(T, side = 1) {
  if (T <= 6) {
    // s1: a restless, slightly handheld drift through the noise; the shake grows toward the end.
    const sh = 0.02 + 0.06 * range(T, 3.5, 6), f = Math.floor(T * 24);
    const jx = (hash(f, 1) - 0.5) * sh * (hash(f, 9) > 0.8 ? 3 : 1), jy = (hash(f, 2) - 0.5) * sh;
    return { pos: [0.3 + Math.sin(T * 0.7) * 0.25 + jx, 4.3 + Math.sin(T * 0.9) * 0.1 + jy, 15.2 - 0.27 * T], look: [0, 2.75, 0], roll: Math.sin(T * 0.6) * 0.02 + jx * 0.2 };
  }
  // s2: a slow push in, drifting to a three-quarter view that leaves room for the words.
  const k = ease.inOut(range(T - 6, 0, 8)), m = side;
  return { pos: [0.3 * (1 - k) - 1.3 * m * k, 4.3 - 0.45 * k, 13.6 - 2.3 * k], look: [-2.3 * m * k, 2.75 - 0.6 * k, 0.6 * k], roll: 0 };
}
export function applyCam(camera, T, side = 1) {
  const c = camAt(T, side);
  camera.position.set(...c.pos); camera.up.set(Math.sin(c.roll), Math.cos(c.roll), 0); camera.lookAt(...c.look);
}

/** A soft dark band behind words (in the 1920x1080 design space, whatever the output size). */
export function band(g, { y, h, alpha = 0.5, x0 = 0, x1 = 1920, color = '8,5,3' }) {
  if (alpha <= 0.002) return;
  const grd = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  grd.addColorStop(0, `rgba(${color},0)`); grd.addColorStop(0.5, `rgba(${color},${alpha})`); grd.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = grd; g.fillRect(x0, y - h / 2, x1 - x0, h);
}
