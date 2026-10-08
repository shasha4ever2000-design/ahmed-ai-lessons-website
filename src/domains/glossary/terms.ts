// Glossary inside lessons: the first time an AI word appears in a lesson's text,
// it becomes a small button that opens its plain-language meaning.

export interface Term { id: string; name: string; other: string; def: string; aliases: string[] }

/** Names a term can be found by: "Large language model (LLM)" -> "Large language model", "LLM". Very short ones are skipped. */
export function aliasesOf(name: string) {
  const out: string[] = [];
  const m = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  for (const a of m ? [m[1], m[2]] : [name]) if (a.trim().length >= 3) out.push(a.trim());
  return out;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SKIP = 'a,button,h1,h2,h3,h4,code,.sheet,.compare,.callout__title,.term-ref,.blank,.learn';

/** Wrap the first match of each term (up to `max` terms) inside the given text blocks. */
export function linkTerms(blocks: HTMLElement[], terms: Term[], lang: string, max = 6) {
  const used = new Set<string>();
  // Longer names first, so "context window" wins over "context".
  const list = terms.flatMap(t => t.aliases.map(a => ({ t, a }))).sort((x, y) => y.a.length - x.a.length);
  // English allows a plural ending; Arabic words take letters on the front, so only whole words separated by spaces or punctuation match.
  const re = (a: string) => lang === 'ar'
    ? new RegExp(`(^|[\\s(«"'،؛:])(${esc(a)})(?=[\\s.,،؛:!?)»"']|$)`)
    : new RegExp(`(^|[^\\p{L}\\p{N}])(${esc(a)}(?:s|es)?)(?![\\p{L}\\p{N}])`, 'iu');
  for (const { t, a } of list) {
    if (used.size >= max) break;
    if (used.has(t.id)) continue;
    const r = re(a);
    for (const block of blocks) {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      let hit: { node: Text; at: number; len: number } | null = null;
      while (walker.nextNode()) {
        const n = walker.currentNode as Text;
        const m = n.data.match(r);
        if (m) { hit = { node: n, at: m.index! + m[1].length, len: m[2].length }; break; }
      }
      if (!hit) continue;
      const word = hit.node.splitText(hit.at);
      word.splitText(hit.len);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'term-ref';
      b.dataset.term = t.id;
      b.setAttribute('aria-haspopup', 'dialog');
      b.textContent = word.data;
      word.replaceWith(b);
      used.add(t.id);
      break;
    }
  }
  return used.size;
}
