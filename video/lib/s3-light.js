// Shared kit for the courtyard (s3) and end card (s6): pointed arches, arch-shaped mashrabiya
// lattices, matching light masks, fake volumetric light shafts + floor light pools, dust motes,
// a monotone camera curve and a text-fit helper. Everything is built once at setup; per frame only
// uniforms change, so every frame is a pure function of t.
import { tile } from './patterns.js';
import { FONT } from './type.js';

/** Pointed (Islamic) arch outline, origin at bottom-centre, width w, total height H. */
export function archOutline(w, H, { k = 0.82, seg = 22, yMin = 0 } = {}) {
  const r = k * w, cx = w / 2 - r; // centre of the right-hand arc (left of the right jamb)
  const th = Math.acos(-cx / r), rise = r * Math.sin(th), ys = H - rise;
  const pts = [[-w / 2, yMin], [w / 2, yMin], [w / 2, ys]];
  for (let i = 1; i <= seg; i++) { const a = (th * i) / seg; pts.push([cx + r * Math.cos(a), ys + r * Math.sin(a)]); }
  for (let i = seg - 1; i >= 0; i--) { const a = (th * i) / seg; pts.push([-(cx + r * Math.cos(a)), ys + r * Math.sin(a)]); }
  pts.push([-w / 2, ys]);
  return pts;
}

function inside(pts, x, y) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const toShape = (THREE, pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));

/**
 * An arch-shaped lattice in the site's pattern `kind`. Returns
 * { shape (THREE.Shape with holes), solids ([THREE.Shape]), holes ([[x,y]...] world polygons), solidPolys }.
 * Holes are only kept when they sit fully inside the arch inset by `inset`.
 */
export function archLattice(THREE, kind, w, H, tileW, { inset = 0.07, grow = 0.12, yMin = 0, yCut = null, k } = {}) {
  const t = tile(kind), sc = tileW / t.w;
  const outer = archOutline(w + grow * 2, H + grow, { k, yMin: (yCut ?? yMin) - (yCut == null ? grow : 0) });
  const inner = archOutline(w - inset * 2, H - inset, { k, yMin: (yCut ?? yMin) + inset });
  const cols = Math.ceil(w / tileW) + 2, rows = Math.ceil(H / (t.h * sc)) + 2;
  // Put a tile centre on the arch axis so the pattern is symmetric.
  const x0 = -(Math.floor(cols / 2) + 0.5) * t.w * sc, y0 = (yCut ?? yMin) - 0.5 * t.h * sc;
  const holes = [], solidPolys = [], seen = new Set();
  const map = ([px, py], c, r) => [x0 + (px + c * t.w) * sc, y0 + (py + r * t.h) * sc];
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
    for (const hole of t.holes) {
      const pts = hole.map(p => map(p, c, r));
      if (!pts.every(([x, y]) => inside(inner, x, y))) continue;
      const key = pts.map(p => p.map(v => v.toFixed(3)).join(',')).join(';'); if (seen.has(key)) continue; seen.add(key);
      holes.push(pts);
    }
    for (const s of t.solidsInHoles || []) {
      const pts = s.map(p => map(p, c, r));
      if (pts.every(([x, y]) => inside(inner, x, y))) solidPolys.push(pts);
    }
  }
  const shape = toShape(THREE, outer);
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  return { shape, holes, solidPolys, solids: solidPolys.map(p => toShape(THREE, p)), outer };
}

/** Grey-scale mask (white = light gets through) of a lattice over its arch bounding box [-w/2,w/2]x[yMin,yMin+H]. */
export function latticeMask(THREE, lat, w, H, { px = 512, blur = 0, yMin = 0, k } = {}) {
  const cw = px, ch = Math.round((px * H) / w), cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch);
  if (blur) g.filter = `blur(${blur}px)`;
  const P = ([x, y]) => [((x + w / 2) / w) * cw, (1 - (y - yMin) / H) * ch];
  const poly = pts => { g.beginPath(); pts.forEach((p, i) => { const [a, b] = P(p); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); g.fill(); };
  g.fillStyle = '#fff'; lat.holes.forEach(poly);
  g.fillStyle = '#000'; lat.solidPolys.forEach(poly);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.anisotropy = 4;
  return tex;
}

/**
 * Fake volumetric light: N quads, each a copy of the window's light mask pushed along the light
 * direction (dx, -1, dz) per unit of height, so slice s=1 lies flat on the floor (y = 0).
 * The window mask covers the box x in [cx-w/2, cx+w/2], y in [y0, y0+H] on the plane z = zw.
 */
export function lightShafts(THREE, { mask, color, cx, y0, w, H, zw, dx, dz, N = 18, s0 = 0.03, s1 = 0.97 }) {
  const pos = [], uv = [], ss = [], idx = [];
  const corner = (u, v, s) => { const x = cx + (u - 0.5) * w, y = y0 + v * H; return [x + s * y * dx, y * (1 - s), zw + s * y * dz]; };
  for (let i = 0; i < N; i++) {
    const s = s0 + ((s1 - s0) * i) / (N - 1), b = pos.length / 3;
    for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { pos.push(...corner(u, v, s)); uv.push(u, v); ss.push(s); }
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('s', new THREE.Float32BufferAttribute(ss, 1));
  geo.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    uniforms: { mask: { value: mask }, color: { value: new THREE.Color(color) }, amp: { value: 1 }, time: { value: 0 } },
    vertexShader: `attribute float s; varying vec2 vUv; varying float vS;
      void main(){ vUv = uv; vS = s; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D mask; uniform vec3 color; uniform float amp, time; varying vec2 vUv; varying float vS;
      void main(){
        float m = texture2D(mask, vUv).r;
        float f = smoothstep(0.0, 0.1, vS) * pow(1.0 - vS, 0.8);
        float n = 0.78 + 0.22 * sin(vUv.y * 17.0 + vUv.x * 5.0 - time * 0.45 + vS * 6.0);
        gl_FragColor = vec4(color * (m * f * n * amp), 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.renderOrder = 5;
  return { mesh, mat, corner };
}

/** The pattern of light lying on the floor (slice s = 1). sharp + soft masks. */
export function lightPool(THREE, { sharp, soft, color, cx, y0, w, H, zw, dx, dz, floorY = 0.004 }) {
  const corner = (u, v) => { const x = cx + (u - 0.5) * w, y = y0 + v * H; return [x + y * dx, floorY, zw + y * dz]; };
  const pos = [], uv = [];
  for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { pos.push(...corner(u, v)); uv.push(u, v); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const mat = new THREE.ShaderMaterial({
    uniforms: { sharp: { value: sharp }, soft: { value: soft }, color: { value: new THREE.Color(color) }, amp: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D sharp, soft; uniform vec3 color; uniform float amp; varying vec2 vUv;
      void main(){
        float m = texture2D(sharp, vUv).r * 0.9 + texture2D(soft, vUv).r * 0.45;
        float f = 0.55 + 0.45 * (1.0 - vUv.y);
        gl_FragColor = vec4(color * (m * f * amp), 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.renderOrder = 4;
  return { mesh, mat };
}

/** Glowing "room light" behind a lattice: a plane with a vertical HDR gradient. */
export function backplate(THREE, { color, w, h, top = 1.35, bottom = 0.45 }) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) }, amp: { value: 1 }, top: { value: top }, bottom: { value: bottom } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 color; uniform float amp, top, bottom; varying vec2 vUv;
      void main(){ float g = mix(bottom, top, pow(vUv.y, 1.3)); float c = 1.0 - 0.35 * pow(abs(vUv.x - 0.5) * 2.0, 2.0);
        gl_FragColor = vec4(color * g * c * amp, 1.0); }`,
  });
  return { mesh: new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat), mat };
}

/** Dust motes floating in a light volume; brightness taken from the mask so they only glint inside beams. */
export function motes(THREE, { rand, n = 140, mask, color, cx, y0, w, H, zw, dx, dz, size = 0.05 }) {
  const pos = [], uv = [], ph = [];
  for (let i = 0; i < n; i++) {
    const u = rand(), v = rand(), s = 0.08 + rand() * 0.8;
    const x = cx + (u - 0.5) * w, y = y0 + v * H;
    pos.push(x + s * y * dx, y * (1 - s), zw + s * y * dz); uv.push(u, v); ph.push(rand() * 6.283, 0.5 + rand());
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('ph', new THREE.Float32BufferAttribute(ph, 2));
  const mat = new THREE.ShaderMaterial({
    uniforms: { mask: { value: mask }, color: { value: new THREE.Color(color) }, amp: { value: 1 }, time: { value: 0 }, size: { value: size }, scale: { value: 540 } },
    vertexShader: `attribute vec2 ph; uniform sampler2D mask; uniform float time, size, scale; varying float vB;
      void main(){
        vec3 p = position + vec3(sin(time * 0.31 * ph.y + ph.x) * 0.12, sin(time * 0.23 * ph.y + ph.x * 1.7) * 0.10 - time * 0.03 * ph.y, cos(time * 0.27 * ph.y + ph.x) * 0.12);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vB = 0.25 + 0.75 * texture2D(mask, uv).r;
        vB *= 0.6 + 0.4 * sin(time * 1.3 * ph.y + ph.x * 3.0);
        gl_PointSize = size * scale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 color; uniform float amp; varying float vB;
      void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(color * a * a * vB * amp, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 6;
  return { points: pts, mat };
}

/** Monotone cubic interpolation through [[t, v], ...] (no overshoot). Returns f(t). */
export function curve(keys) {
  const n = keys.length, T = keys.map(k => k[0]), V = keys.map(k => k[1]);
  const h = [], d = [];
  for (let i = 0; i < n - 1; i++) { h.push(T[i + 1] - T[i]); d.push((V[i + 1] - V[i]) / h[i]); }
  const m = [d[0]];
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (3 * (h[i - 1] + h[i])) / ((2 * h[i] + h[i - 1]) / d[i - 1] + (h[i] + 2 * h[i - 1]) / d[i]));
  m.push(d[n - 2]);
  return t => {
    if (t <= T[0]) return V[0] + m[0] * (t - T[0]) * 0;
    if (t >= T[n - 1]) return V[n - 1];
    let i = 0; while (t > T[i + 1]) i++;
    const s = (t - T[i]) / h[i], s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * V[i] + (s3 - 2 * s2 + s) * h[i] * m[i] + (-2 * s3 + 3 * s2) * V[i + 1] + (s3 - s2) * h[i] * m[i + 1];
  };
}

/** Largest font size <= size at which text fits maxW (design-space px). */
export function fitSize(g, text, { size, min = 24, maxW, font = 'display', weight = 600 }) {
  g.save();
  let s = size;
  for (; s > min; s -= 2) { g.font = `${weight} ${s}px ${FONT[font]}`; if (g.measureText(text).width <= maxW) break; }
  g.restore();
  return s;
}

/** Soft elliptical darkening behind a block of text (keeps words readable over the light). */
export function softScrim(g, { x, y, rx, ry, alpha = 0.5 }) {
  if (alpha <= 0.002) return;
  g.save();
  g.translate(x, y); g.scale(1, ry / rx);
  const grd = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  grd.addColorStop(0, `rgba(8,5,3,${alpha})`); grd.addColorStop(0.55, `rgba(8,5,3,${alpha * 0.6})`); grd.addColorStop(1, 'rgba(8,5,3,0)');
  g.fillStyle = grd; g.fillRect(-rx, -rx, rx * 2, rx * 2);
  g.restore();
}
