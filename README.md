# Ahmed Hussein · AI Lessons

The bilingual (English and Arabic) AI lessons site, built with [Astro](https://astro.build) and deployed on Vercel.
Design: **Mashrabiya** — a cedar room behind a carved lattice; the better your prompt, the more light comes in.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where things live

| What | Where |
| --- | --- |
| Lessons (one file per lesson per language) | `src/content/lessons/en/<slug>.md`, `src/content/lessons/ar/<slug>.md` |
| Interface text in both languages (menus, homepage, buttons) | `src/i18n.ts` |
| Glossary, AI tool library, FAQ, Finance and Microsoft 365 pages | `src/data/site-data.json` |
| Colours, fonts, lesson styles | `src/styles/global.css` |
| Homepage, lesson page, lists | `src/components/` |
| 3D lattice room | `src/scripts/lattice.ts` |
| Standalone tools (Prompt Grader, quiz, time saved, certificate, prompt of the day, Prompt Library, links) | `public/*.html`, styled by `public/ahl-theme.css` |
| Social links | `src/i18n.ts` (`SOCIALS`) and `public/ahl-links.js` |
| Chat button settings (tawk.to, WhatsApp) | `public/chat-config.json` |

## Add a lesson

1. Copy an existing lesson file in `src/content/lessons/en/` and give it a new name, for example `my-new-lesson.md`. The file name is the web address: `/lessons/my-new-lesson/`.
2. Edit the details at the top (between the `---` lines): `slug` (same as the file name), `number`, `track` (`ai-for-work`, `finance` or `microsoft-365`), `topic`, `title`, `lede`, `summary`, `description`, `level`, `minutes`, `updated` (YYYY-MM-DD) and `toc` (the "On this page" list; each `id` must match a section `id` in the body).
3. Write the lesson body below the second `---`. It is HTML and is inserted exactly as written; copy the building blocks (prompt cards, tips, compare boxes, steps, takeaway) from another lesson.
4. Do the same in `src/content/lessons/ar/` with the same file name.
5. Add an image for link previews at `public/media/og/en-<slug>.jpg` and `public/media/og/ar-<slug>.jpg` (1200 × 630).

The lessons list, track pages, pager, sitemap and Start Here progress update automatically.

## Saved progress

Progress lives in the visitor's browser under the same keys as before, so nobody loses their ticks:
`ahl:done` (finished lessons), `ahl:cert` (step 1 and certificate details), `ahl:theme` (light or dark).
