// s4 helpers: a faceted 8-point star gem, soft sprite textures and a warm environment map.

/** A cut 8-point star gem: star girdle, a raised crown ring + flat table on the front, a pointed pavilion behind. */
export function starGemGeometry(THREE, R = 1, r = 0.66) {
  const n = 8, pos = [];
  const ring = (k, z, rot = 0) => Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / n + rot, rad = (i % 2 ? r : R) * k;
    return [rad * Math.cos(a), rad * Math.sin(a), z];
  });
  const girdle = ring(1, 0), girdleB = ring(1, -0.06), crown = ring(0.5, 0.3), table = ring(0.36, 0.36);
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  const m = n * 2;
  for (let i = 0; i < m; i++) {
    const j = (i + 1) % m;
    // girdle band (thin vertical edge)
    tri(girdleB[i], girdleB[j], girdle[j]); tri(girdleB[i], girdle[j], girdle[i]);
    // crown facets: girdle -> crown ring
    tri(girdle[i], girdle[j], crown[j]); tri(girdle[i], crown[j], crown[i]);
    // crown ring -> table edge
    tri(crown[i], crown[j], table[j]); tri(crown[i], table[j], table[i]);
    // table (flat front)
    tri(table[i], table[j], [0, 0, 0.36]);
    // pavilion: back to a point
    tri(girdleB[j], girdleB[i], [0, 0, -0.5]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Radial glow texture (white, alpha falloff). */
export function glowTexture(THREE, size = 256, stops = [[0, 1], [0.25, 0.55], [0.6, 0.12], [1, 0]]) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, a] of stops) grd.addColorStop(o, `rgba(255,255,255,${a})`);
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** A thin soft ring (shockwave) texture. */
export function ringTexture(THREE, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), h = size / 2;
  const grd = g.createRadialGradient(h, h, h * 0.62, h, h, h * 0.98);
  grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.55, 'rgba(255,255,255,0.9)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** A small warm room baked into a PMREM env map (for gem / glass reflections). */
export function warmEnv(THREE, renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 24, 12), new THREE.MeshBasicMaterial({ color: '#140c07', side: THREE.BackSide })));
  const panel = (w, h, col, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
  };
  panel(9, 5, new THREE.Color('#ffb85c').multiplyScalar(2.2), 0, 2, -8);
  panel(3, 6, new THREE.Color('#ffd79a').multiplyScalar(1.4), -7, 1, -2, Math.PI / 2);
  panel(3, 6, new THREE.Color('#f2a33a').multiplyScalar(0.8), 7, 1, 1, -Math.PI / 2);
  panel(12, 3, new THREE.Color('#ffe6c4').multiplyScalar(1.1), 0, 8, 0, 0, Math.PI / 2);
  panel(6, 2, new THREE.Color('#5a3a22'), 0, -3, 6);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.03);
  pm.dispose();
  return rt.texture;
}
