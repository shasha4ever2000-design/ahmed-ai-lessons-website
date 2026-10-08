// Search index for one language, built with the site and loaded only when someone opens search.
// Each entry: k = kind, t = title, s = short line under the title, u = link, h = extra words to match.
import { getCollection } from 'astro:content';
import { T, FREE_TOOLS, pre, type Lang } from '../../i18n';
import data from '../../data/site-data.json';

export function getStaticPaths() {
  return [{ params: { lang: 'en' } }, { params: { lang: 'ar' } }];
}

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n) > 0 ? s.lastIndexOf(' ', n) : n) : s);

export async function GET({ params }: { params: { lang: Lang } }) {
  const lang = params.lang, p = pre(lang), t = T[lang], d = (data as any)[lang];
  const home = lang === 'ar' ? '/ar/' : '/';
  const out: { k: string; t: string; s?: string; u: string; h?: string }[] = [];
  const lessons = (await getCollection('lessons', l => l.data.lang === lang)).sort((a, b) => a.data.number - b.data.number);

  for (const l of lessons) {
    const x = l.data, url = `${p}/lessons/${x.slug}/`;
    out.push({ k: 'lesson', t: x.title, s: `${t.lesson.n.replace('{n}', String(x.number))} · ${x.topic}`, u: url, h: clip(`${x.summary} ${x.description} ${x.level}`, 400) });
    // Each section of the lesson, with its own words, links straight to that part of the page.
    const body = l.body || '';
    for (const sec of x.toc) {
      const i = body.indexOf(`id="${sec.id}"`);
      const rest = i < 0 ? '' : body.slice(i);
      const end = rest.indexOf('<section', 10);
      // The section's words, without its own heading (that is already the title).
      let words = text((end > 0 ? rest.slice(0, end) : rest).replace(/^id="[^"]*"[^>]*>/, ''));
      if (words.startsWith(sec.label)) words = words.slice(sec.label.length).trim();
      out.push({ k: 'section', t: sec.label, s: x.title, u: `${url}#${sec.id}`, h: clip(words, 500) });
    }
  }
  for (const g of d.glossary.terms) out.push({ k: 'term', t: g.name, s: g.other, u: `${p}/glossary/#${g.id}`, h: clip(text(g.def), 300) });
  for (const x of FREE_TOOLS) { const [title, line] = lang === 'ar' ? x.arT : x.en; out.push({ k: 'free', t: title, s: line, u: lang === 'ar' ? x.ar : x.href }); }
  for (const x of d.tools.tools) out.push({ k: 'tool', t: x.name, s: x.does, u: `${p}/tools/`, h: `${x.maker} ${x.best} ${x.category}` });
  for (const x of d.faq.items) out.push({ k: 'faq', t: x.q, u: `${home}#faq`, h: clip(text(x.a), 300) });
  out.push(
    { k: 'page', t: t.list.title, s: t.list.lede, u: `${p}/lessons/` },
    { k: 'page', t: d.finance.title, s: d.finance.lede, u: `${p}/finance/` },
    { k: 'page', t: d.m365.title, s: d.m365.lede, u: `${p}/microsoft-365/` },
    { k: 'page', t: d.tools.title, s: d.tools.lede, u: `${p}/tools/` },
    { k: 'page', t: d.glossary.title, s: d.glossary.lede, u: `${p}/glossary/` },
    { k: 'page', t: t.home.startH, s: t.home.startP, u: `${home}#start` },
    { k: 'page', t: t.home.bH, s: t.home.bP, u: `${home}#builder` },
  );
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
