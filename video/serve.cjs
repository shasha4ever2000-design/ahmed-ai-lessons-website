// Tiny static server for the film studio: serves the repo root, so the film can load
// three.js from node_modules and the site's fonts and images from public/.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.wav': 'audio/wav' };
const port = +process.argv[2] || 4400;
http.createServer((q, s) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(ROOT)) { s.writeHead(403); return s.end(); }
  fs.readFile(p, (e, d) => { if (e) { s.writeHead(404); return s.end('404'); } s.writeHead(200, { 'content-type': T[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' }); s.end(d); });
}).listen(port, () => console.log('studio on ' + port));
