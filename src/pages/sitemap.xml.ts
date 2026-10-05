// Sitemap with English/Arabic alternates for every page, built from the lessons and the page list.
import { getCollection } from 'astro:content';
import { SITE } from '../i18n';

const STATIC = ['/', '/lessons/', '/finance/', '/microsoft-365/', '/tools/', '/glossary/',
  '/prompt-library', '/prompt-grader', '/ai-tool-quiz', '/time-saved', '/prompt-of-the-day', '/certificate'];

export async function GET() {
  const lessons = await getCollection('lessons', l => l.data.lang === 'en');
  const today = new Date().toISOString().slice(0, 10);
  const pages = [...STATIC.map(p => ({ en: p, date: today })), ...lessons.map(l => ({ en: `/lessons/${l.data.slug}/`, date: l.data.updated }))];
  const ar = (p: string) => (p === '/' ? '/ar/' : '/ar' + p);
  const alt = (p: string) =>
    `<xhtml:link rel="alternate" hreflang="en" href="${SITE}${p}"/><xhtml:link rel="alternate" hreflang="ar" href="${SITE}${ar(p)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${p}"/>`;
  const urls = pages.flatMap(({ en, date }) => [en, ar(en)].map(u => `<url><loc>${SITE}${u}</loc><lastmod>${date}</lastmod>${alt(en)}</url>`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
