// The site's three mashrabiya patterns, as 2D outlines for three.js (same as src/domains/scenes/patterns.ts).
//   'ai'      : 8-point stars + small diamonds (AI for work, amber)
//   'finance' : 6-point stars on a hex grid + dots (Finance & CMA, teal)
//   'm365'    : diamonds with a square window + corner squares (Microsoft 365, blue)
export function starPts(cx, cy, n, R, r, rotDeg = -90) {
  const out = [];
  for (let i = 0; i < n * 2; i++) { const a = ((rotDeg + (i * 180) / n) * Math.PI) / 180, rad = i % 2 ? r : R; out.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); }
  return out;
}
const diamond = (cx, cy, s) => [[cx, cy - s], [cx + s, cy], [cx, cy + s], [cx - s, cy]];
const square = (cx, cy, s) => [[cx - s, cy - s], [cx + s, cy - s], [cx + s, cy + s], [cx - s, cy + s]];

/** Holes (open parts) of one tile, in tile units; tile size returned as w,h. */
export function tile(kind) {
  if (kind === 'finance') {
    const w = 56, h = 56 * Math.sqrt(3);
    const holes = [[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]].map(([x, y]) => starPts(x, y, 6, 17, 9.8));
    [[w / 2, 0], [w / 2, h], [0, h / 2], [w, h / 2]].forEach(([x, y]) => holes.push(starPts(x, y, 6, 3.4, 3.4, 0)));
    return { w, h, holes };
  }
  if (kind === 'm365') {
    const holes = [diamond(28, 28, 19), ...[[0, 0], [56, 0], [0, 56], [56, 56]].map(([x, y]) => square(x, y, 6.5)), ...[[28, 0], [28, 56], [0, 28], [56, 28]].map(([x, y]) => square(x, y, 2))];
    return { w: 56, h: 56, holes, solidsInHoles: [square(28, 28, 6)] };
  }
  return { w: 56, h: 56, holes: [starPts(28, 28, 8, 19, 12.5, -90 + 11.25), ...[[0, 0], [56, 0], [0, 56], [56, 56]].map(([x, y]) => diamond(x, y, 4))] };
}

/**
 * A mashrabiya panel as a THREE.Shape with holes, cols x rows tiles, centred on the origin,
 * `scale` units per tile unit. Holes that would cross the panel edge are left out.
 * Extrude it (THREE.ExtrudeGeometry) for a real 3D carved screen.
 */
export function panelShape(THREE, kind, cols, rows, scale = 0.02, margin = 6) {
  const t = tile(kind), W = cols * t.w, H = rows * t.h;
  const ox = -W / 2 - margin, oy = -H / 2 - margin;
  const shape = new THREE.Shape();
  const P = (x, y) => new THREE.Vector2((x + ox + margin) * scale, -(y + oy + margin) * scale);
  shape.moveTo(...P(-margin, -margin).toArray()); shape.lineTo(...P(W + margin, -margin).toArray()); shape.lineTo(...P(W + margin, H + margin).toArray()); shape.lineTo(...P(-margin, H + margin).toArray()); shape.closePath();
  const seen = new Set();
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) for (const hole of t.holes) {
    const pts = hole.map(([x, y]) => [x + c * t.w, y + r * t.h]);
    if (pts.some(([x, y]) => x < 0.5 || y < 0.5 || x > W - 0.5 || y > H - 0.5)) continue;
    const key = pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(';'); if (seen.has(key)) continue; seen.add(key);
    // Holes wind the opposite way to the outline.
    const path = new THREE.Path(pts.slice().reverse().map(([x, y]) => P(x, y)));
    shape.holes.push(path);
  }
  return shape;
}
