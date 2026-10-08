// Prompt blanks: "[topic]", "[job]" and the like become small boxes you can type into.
// What you type is remembered (per blank name), so "[job]" filled once is filled everywhere.
import { KEYS, read, write } from '../learning/storage';

const PH = /\[([^\[\]\n]{1,60})\]/g;
const key = (ph: string) => ph.trim().toLowerCase();

function memory(): Record<string, string> {
  const m = read<Record<string, string>>(KEYS.blanks, {});
  return m && typeof m === 'object' ? m : {};
}
function remember(ph: string, value: string) {
  const m = memory();
  if (value.trim()) m[key(ph)] = value.slice(0, 300); else delete m[key(ph)];
  // Keep the newest 80 names so the record stays small.
  const keys = Object.keys(m);
  if (keys.length > 80) delete m[keys[0]];
  write(KEYS.blanks, m);
}

/** Does this text have any blanks? */
export const hasBlanks = (text: string) => new RegExp(PH.source).test(text);

/** Turn every [blank] inside the given prompt elements into an editable box. Returns how many boxes were made. */
export function enhanceBlanks(els: Iterable<HTMLElement>, label: string) {
  const mem = memory();
  let made = 0;
  const editable = (() => { const s = document.createElement('span'); s.contentEditable = 'plaintext-only'; return s.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true'; })();
  for (const el of els) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) { const n = walker.currentNode as Text; if (hasBlanks(n.data)) nodes.push(n); }
    for (const n of nodes) {
      const frag = document.createDocumentFragment();
      let last = 0;
      for (const m of n.data.matchAll(PH)) {
        frag.append(n.data.slice(last, m.index));
        const b = document.createElement('span');
        b.className = 'blank';
        b.contentEditable = editable;
        b.setAttribute('role', 'textbox');
        b.setAttribute('aria-label', `${label}: ${m[1]}`);
        b.spellcheck = false;
        b.dataset.ph = m[1];
        b.textContent = mem[key(m[1])] || '';
        frag.append(b);
        last = m.index! + m[0].length;
        made++;
      }
      frag.append(n.data.slice(last));
      n.replaceWith(frag);
    }
  }
  return made;
}

/** Listen once on a container: typing in one blank fills every blank with the same name, and is remembered. */
export function syncBlanks(root: HTMLElement) {
  root.addEventListener('input', e => {
    const b = (e.target as Element).closest<HTMLElement>('.blank');
    if (!b) return;
    const v = b.textContent || '';
    root.querySelectorAll<HTMLElement>('.blank').forEach(o => { if (o !== b && key(o.dataset.ph!) === key(b.dataset.ph!)) o.textContent = v; });
    remember(b.dataset.ph!, v);
  });
  root.addEventListener('keydown', e => {
    // A blank is one line: Enter finishes it instead of adding a line break.
    if ((e.target as Element).closest?.('.blank') && e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).blur(); }
  });
  root.addEventListener('paste', e => {
    const b = (e.target as Element).closest?.('.blank');
    if (!b || !e.clipboardData) return;
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain').replace(/\s+/g, ' '));
  });
}

/** The prompt text as it would be copied: filled blanks use what was typed, empty ones keep "[name]". */
export function textWithBlanks(el: Element) {
  const c = el.cloneNode(true) as HTMLElement;
  c.querySelectorAll<HTMLElement>('.blank').forEach(b => b.replaceWith((b.textContent || '').trim() || `[${b.dataset.ph}]`));
  return (c.textContent || '').trim();
}

/** Empty every blank inside an element (and forget those names). */
export function clearBlanks(el: Element) {
  el.querySelectorAll<HTMLElement>('.blank').forEach(b => { b.textContent = ''; remember(b.dataset.ph!, ''); });
}
