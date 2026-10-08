// Makes the link-preview images (public/media/og/*.jpg, 1200x630) in the site's own style.
// Each image is built from the live page (its heading and topic line), so it always matches.
//
// Run against a local build:  npm run build && npx astro preview   (or any server on port 4321)
// then:                         node scripts/og-images.mjs [http://localhost:4321]
// Needs Playwright installed (npm i -D playwright, or a global install found via NODE_PATH).
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:4321';
const OUT = new URL('../public/media/og/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const slugs = readdirSync(new URL('../src/content/lessons/en/', import.meta.url)).map(f => f.replace(/\.md$/, ''));
const pages = { home: '/', lessons: '/lessons/', finance: '/finance/', 'microsoft-365': '/microsoft-365/', tools: '/tools/', glossary: '/glossary/' };
const targets = [];
for (const lang of ['en', 'ar']) {
  const pre = lang === 'ar' ? '/ar' : '';
  for (const [name, path] of Object.entries(pages)) targets.push({ file: `${lang}-${name}.jpg`, url: pre + path, lang, lesson: false });
  for (const s of slugs) targets.push({ file: `${lang}-${s}.jpg`, url: `${pre}/lessons/${s}/`, lang, lesson: true });
}

const LATTICE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cpolygon points='46.63,31.71 40.06,36.06 38.56,43.80 30.83,42.22 24.29,46.63 19.94,40.06 12.20,38.56 13.78,30.83 9.37,24.29 15.94,19.94 17.44,12.20 25.17,13.78 31.71,9.37 36.06,15.94 43.80,17.44 42.22,25.17' fill='%23f2b45a'/%3E%3Cpolygon points='0,-4 4,0 0,4 -4,0' fill='%23f2b45a'/%3E%3Cpolygon points='56,-4 60,0 56,4 52,0' fill='%23f2b45a'/%3E%3Cpolygon points='0,52 4,56 0,60 -4,56' fill='%23f2b45a'/%3E%3Cpolygon points='56,52 60,56 56,60 52,56' fill='%23f2b45a'/%3E%3C/svg%3E\")";

const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const card = ({ lang, kicker, title, lede }) => `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:Messiri;src:url(/assets/el-messiri-latin-var.woff2) format("woff2");font-weight:400 700;unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Messiri;src:url(/assets/el-messiri-arabic-var.woff2) format("woff2");font-weight:400 700;unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFC}
@font-face{font-family:Plex;src:url(/assets/ibm-plex-sans-arabic-latin-600-normal-KrqB56Mw.woff2) format("woff2");font-weight:600;unicode-range:U+0000-00FF}
@font-face{font-family:Plex;src:url(/assets/ibm-plex-sans-arabic-arabic-600-normal-DIa3GCJg.woff2) format("woff2");font-weight:600;unicode-range:U+0600-06FF}
@font-face{font-family:Plex;src:url(/assets/ibm-plex-sans-arabic-latin-400-normal-Bo5KPYvw.woff2) format("woff2");font-weight:400;unicode-range:U+0000-00FF}
@font-face{font-family:Plex;src:url(/assets/ibm-plex-sans-arabic-arabic-400-normal-DqElNKgb.woff2) format("woff2");font-weight:400;unicode-range:U+0600-06FF}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#16100c;color:#f3ece3;font-family:Plex,sans-serif;position:relative}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(700px 520px at ${lang === 'ar' ? '18%' : '82%'} 70%,rgb(242 163 58 / .28),transparent 70%)}
.arch{position:absolute;bottom:0;${lang === 'ar' ? 'left' : 'right'}:84px;width:340px;height:520px;border-radius:170px 170px 0 0;border:2px solid #6b5139;overflow:hidden;background:#0f0b08}
.arch::before{content:"";position:absolute;inset:0;background:${LATTICE};background-size:56px 56px;background-position:center top;opacity:.92;filter:drop-shadow(0 0 10px rgb(255 190 110 / .55))}
.arch::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgb(22 16 12 / .1),rgb(22 16 12 / .55))}
.copy{position:absolute;top:70px;${lang === 'ar' ? 'right' : 'left'}:76px;width:640px;height:490px;display:flex;flex-direction:column}
.kicker{font-weight:600;font-size:26px;color:#f2a33a}
h1{font-family:Messiri,serif;font-weight:600;font-size:76px;line-height:1.12;letter-spacing:${lang === 'ar' ? '0' : '-0.02em'};margin-top:18px;text-wrap:balance}
p.lede{margin-top:20px;font-size:27px;line-height:1.45;color:#cdbba8;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.by{margin-top:auto;display:flex;align-items:center;gap:16px}
.by img{width:62px;height:62px;border-radius:50%;border:2px solid #6b5139;object-fit:cover}
.by b{display:block;font-size:24px}.by span{font-size:20px;color:#b9a691}
</style></head><body><div class="arch"></div><div class="copy">
<p class="kicker">${esc(kicker)}</p><h1 id="t">${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
<div class="by"><img src="/media/avatar-160.webp" alt=""><div><b>${lang === 'ar' ? 'أحمد حسين' : 'Ahmed Hussein'}</b><span>${lang === 'ar' ? 'دروس الذكاء الاصطناعي' : 'AI Lessons'}</span></div></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const tg of targets) {
  await page.goto(BASE + tg.url, { waitUntil: 'domcontentloaded' });
  const info = await page.evaluate(lesson => {
    const h1 = (document.querySelector('h1')?.textContent || '').replace(/\s+/g, ' ').trim();
    const kick = lesson
      ? [...document.querySelectorAll('.topic-banner span')].map(s => s.textContent.trim()).filter(x => x && x !== '·')
      : [];
    const lede = (document.querySelector('.hero .lede, .page-head .lede, .lede')?.textContent || '').replace(/\s+/g, ' ').trim();
    return { h1, kick, lede };
  }, tg.lesson);
  const min = tg.lesson ? await page.$eval('#time-left', e => e.dataset.min) : '';
  const kicker = tg.lesson
    ? `${info.kick[0]}  ·  ${info.kick[1]}`
    : (tg.lang === 'ar' ? 'دروس ببلاش بالعربي والإنجليزي' : 'Free lessons in English and Arabic');
  const lede = tg.lesson ? '' : (info.lede.length > 130 ? info.lede.slice(0, info.lede.lastIndexOf(' ', 125)) + '…' : info.lede);
  // Leave the page first (a blank file on the same site), so none of its scripts touch the card.
  await page.goto(BASE + '/robots.txt');
  await page.setContent(card({ lang: tg.lang, kicker, title: info.h1, lede: tg.lesson ? `${min} ${tg.lang === 'ar' ? 'دقايق قراية' : 'min read'}` : lede }), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Shrink long titles until they fit three lines' worth of space.
  // Pages with an intro line keep the title to about two lines; lessons may use three.
  await page.evaluate(max => { const t = document.getElementById('t'); let s = 76; while (t.getBoundingClientRect().height > max && s > 44) { s -= 2; t.style.fontSize = s + 'px'; } }, tg.lesson ? 270 : 190);
  await page.screenshot({ path: OUT + tg.file, type: 'jpeg', quality: 86 });
  console.log('made', tg.file);
}
await browser.close();
