import { defineConfig } from 'astro/config';

// Static site. Every page is built to <path>/index.html so /lessons/x and /lessons/x/ both work.
export default defineConfig({
  site: 'https://ahmed-ai-lessons-website.vercel.app',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
});
