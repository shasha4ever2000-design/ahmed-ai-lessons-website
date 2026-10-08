// Search context: load the index for the page's language once, then rank entries for a query.
// Matching is forgiving: case, accents, Arabic vowel marks and letter variants (أ إ آ ا, ى ي, ة ه) are ignored.

export interface Entry { k: string; t: string; s?: string; u: string; h?: string }
interface Prepared extends Entry { nt: string; ns: string; nh: string }

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const cache: Record<string, Promise<Prepared[]>> = {};
export function loadIndex(lang: string): Promise<Prepared[]> {
  return (cache[lang] ??= fetch(`/search/${lang}.json`)
    .then(r => (r.ok ? r.json() : []))
    .then((list: Entry[]) => list.map(e => ({ ...e, nt: normalize(e.t), ns: normalize(e.s || ''), nh: normalize(e.h || '') })))
    .catch(() => { delete cache[lang]; return []; }));
}

// Lessons first, then pages and tools, then the finer-grained matches.
const KIND_WEIGHT: Record<string, number> = { lesson: 6, page: 5, free: 4, term: 4, section: 2, faq: 2, tool: 1 };

const startsWord = (hay: string, w: string) => hay.startsWith(w) || hay.includes(' ' + w);

export function rank(index: Prepared[], query: string, limit = 12): Entry[] {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const scored: { e: Prepared; n: number }[] = [];
  for (const e of index) {
    let n = 0;
    for (const w of words) {
      // Every word has to appear somewhere; where it appears decides how high the entry ranks.
      if (e.nt.startsWith(w)) n += 14;
      else if (startsWord(e.nt, w)) n += 10;
      else if (e.nt.includes(w)) n += 6;
      else if (startsWord(e.ns, w)) n += 4;
      else if (e.ns.includes(w)) n += 3;
      else if (startsWord(e.nh, w)) n += 2;
      else if (e.nh.includes(w)) n += 1;
      else { n = 0; break; }
    }
    if (n) scored.push({ e, n: n + (KIND_WEIGHT[e.k] || 0) });
  }
  scored.sort((a, b) => b.n - a.n);
  // Keep the list varied: at most four "inside a lesson" hits.
  const out: Entry[] = []; let sections = 0;
  for (const { e } of scored) {
    if (e.k === 'section' && ++sections > 4) continue;
    out.push(e);
    if (out.length === limit) break;
  }
  return out;
}

/** A short piece of the matched text around the first query word, for context under the title. */
export function snippet(e: Entry, query: string, max = 110) {
  const src = e.k === 'section' || e.k === 'term' || e.k === 'faq' ? e.h || e.s || '' : e.s || e.h || '';
  const w = normalize(query).split(' ')[0];
  if (!w) return src.slice(0, max);
  const i = normalize(src).indexOf(w);
  // normalize() can shift positions slightly; this is only for a preview, so close is fine.
  const from = i > 40 ? src.lastIndexOf(' ', i - 30) + 1 : 0;
  const s = src.slice(from, from + max);
  return (from ? '… ' : '') + s + (from + max < src.length ? ' …' : '');
}
