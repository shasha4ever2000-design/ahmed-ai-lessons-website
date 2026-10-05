import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Lessons live in src/content/lessons/<en|ar>/<slug>.md.
// Front matter holds the facts; the body is the lesson itself (HTML is allowed in Markdown).
const lessons = defineCollection({
  // IDs come from the file path (en/x, ar/x) so the two languages never collide.
  loader: glob({ pattern: '**/*.md', base: './src/content/lessons', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    slug: z.string(),
    lang: z.enum(['en', 'ar']),
    number: z.number(),
    track: z.enum(['ai-for-work', 'finance', 'microsoft-365']),
    topic: z.string(),
    topicIcon: z.string(),
    title: z.string(),
    lede: z.string(),
    summary: z.string(),
    description: z.string(),
    level: z.string(),
    minutes: z.number(),
    updated: z.string(),
    toc: z.array(z.object({ id: z.string(), label: z.string() })),
  }),
});

export const collections = { lessons };
