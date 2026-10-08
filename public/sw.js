// Offline reading. Pages always try the network first (so nobody sees an old lesson while online);
// a copy of each page you open is kept, and shown when there's no connection.
// Built files (/_astro, fonts, images) never change at the same address, so they're served from the copy.
const VERSION = 'v1';
const PAGES = `ahl-pages-${VERSION}`;
const FILES = `ahl-files-${VERSION}`;
const OFFLINE = '/offline/';
const MAX_PAGES = 60;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(PAGES).then(c => c.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('ahl-') && k !== PAGES && k !== FILES).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - MAX_PAGES))) if (!k.url.endsWith(OFFLINE)) await cache.delete(k);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/_vercel/')) return;

  // Pages: network first, keep a copy, fall back to the copy, then to the offline page.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(PAGES);
      try {
        const res = await fetch(req);
        if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
          await cache.put(url.pathname, res.clone());
          trim(cache);
        }
        return res;
      } catch {
        return (await cache.match(url.pathname)) || (await cache.match(url.pathname + '/')) || (await cache.match(OFFLINE)) || Response.error();
      }
    })());
    return;
  }

  // Built files, fonts, images and the search index: use the copy if there is one, refresh it in the background.
  if (/^\/(_astro|assets|media)\//.test(url.pathname) || url.pathname.startsWith('/search/') || url.pathname === '/favicon.svg') {
    e.respondWith((async () => {
      const cache = await caches.open(FILES);
      const hit = await cache.match(req);
      const fresh = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit || Response.error());
      return hit || fresh;
    })());
  }
});
