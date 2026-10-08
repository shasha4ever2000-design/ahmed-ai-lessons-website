// Three mashrabiya patterns, one per track, drawn as plain SVG at build time.
// Each is a single repeating tile; the open parts of the screen are the shapes below.
//   AI for work    : 8-point stars (khatam), the site's own lattice
//   Finance & CMA  : 6-point stars on a hexagonal grid
//   Microsoft 365  : square kufic-style tile (diamonds and corner squares)
export type Track = 'ai-for-work' | 'finance' | 'microsoft-365';

const f = (n: number) => +n.toFixed(2);
function star(cx: number, cy: number, points: number, R: number, r: number, rot = -90) {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = ((rot + (i * 180) / points) * Math.PI) / 180, rad = i % 2 ? r : R;
    out.push(`${f(cx + rad * Math.cos(a))},${f(cy + rad * Math.sin(a))}`);
  }
  return `<polygon points="${out.join(' ')}"/>`;
}
const diamond = (cx: number, cy: number, s: number) => `<polygon points="${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}"/>`;

export interface Tile { w: number; h: number; shapes: string }

export const TILES: Record<Track, Tile> = {
  'ai-for-work': { w: 56, h: 56, shapes: star(28, 28, 8, 19, 12.5, -90 + 11.25) + [[0, 0], [56, 0], [0, 56], [56, 56]].map(([x, y]) => diamond(x, y, 4)).join('') },
  finance: (() => {
    const w = 56, h = f(56 * Math.sqrt(3));
    const s = [[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]].map(([x, y]) => star(x, y, 6, 17, 9.8)).join('');
    const dots = [[w / 2, 0], [w / 2, h], [0, h / 2], [w, h / 2]].map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="3.2"/>`).join('');
    return { w, h, shapes: s + dots };
  })(),
  'microsoft-365': (() => {
    // A diamond with a square window in it, and squares where four tiles meet: the even-odd rule cuts the windows.
    const c = 28, R = 19, q = 6;
    const d = `M${c},${c - R} L${c + R},${c} L${c},${c + R} L${c - R},${c} Z M${c - q},${c - q} L${c - q},${c + q} L${c + q},${c + q} L${c + q},${c - q} Z`;
    const corners = [[0, 0], [56, 0], [0, 56], [56, 56]].map(([x, y]) => `<rect x="${x - 6.5}" y="${y - 6.5}" width="13" height="13"/>`).join('');
    const bars = [[28, 0], [28, 56], [0, 28], [56, 28]].map(([x, y]) => `<rect x="${x - 2}" y="${y - 2}" width="4" height="4"/>`).join('');
    return { w: 56, h: 56, shapes: `<path fill-rule="evenodd" d="${d}"/>` + corners + bars };
  })(),
};

// The tile as a CSS-ready image (used as a mask, so its colour comes from the page's theme).
export function tileDataUri(track: Track) {
  const t = TILES[track];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}" fill="#000">${t.shapes}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const trackOf = (t: string): Track => (t === 'finance' || t === 'microsoft-365' ? t : 'ai-for-work');
