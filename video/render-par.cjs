// Renders the film faster by splitting it into pieces that render side by side (one per CPU core),
// then joins the pieces and adds the soundtrack.
//   node video/render-par.cjs --langs en,ar [--jobs 4 --pieces 4 --w 1920 --h 1080 --fps 30]
const { spawn, spawnSync } = require('child_process');
const path = require('path'), fs = require('fs'), os = require('os');
const a = Object.fromEntries(process.argv.slice(2).reduce((m, v, i, arr) => (v.startsWith('--') ? [...m, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : '1']] : m), []));
const langs = (a.langs || 'en,ar').split(','), jobs = +(a.jobs || os.cpus().length), pieces = +(a.pieces || 4);
const W = a.w || '1920', H = a.h || '1080', fps = +(a.fps || 30), DUR = +(a.duration || 48);
const OUT = path.join(__dirname, 'out'), PARTS = path.join(OUT, 'parts'); fs.mkdirSync(PARTS, { recursive: true });

// Piece boundaries on whole frames, so the joined film has every frame exactly once.
const frames = Math.round(DUR * fps), cut = i => Math.round((frames * i) / pieces) / fps;
const queue = langs.flatMap(lang => Array.from({ length: pieces }, (_, i) => ({ lang, i, from: cut(i), to: cut(i + 1), out: path.join(PARTS, `${lang}-${i}.mp4`) })));

let port = 4500;
const run = p => new Promise((res, rej) => {
  const args = [path.join(__dirname, 'render.cjs'), '--lang', p.lang, '--w', W, '--h', H, '--fps', String(fps), '--from', String(p.from), '--to', String(p.to), '--out', p.out, '--port', String(port++), '--silent'];
  const c = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'inherit'] });
  let log = '';
  c.stdout.on('data', d => { log += d; const l = String(d).trim().split('\n').pop(); if (/frame/.test(l)) console.log(`[${p.lang}-${p.i}] ${l}`); });
  c.on('close', code => (code === 0 && /wrote/.test(log) && !/PAGE ERRORS/.test(log) ? res() : rej(new Error(`${p.lang}-${p.i} failed:\n${log}`))));
});

(async () => {
  const t0 = Date.now(), todo = [...queue];
  await Promise.all(Array.from({ length: jobs }, async () => { while (todo.length) await run(todo.shift()); }));
  for (const lang of langs) {
    const list = path.join(PARTS, `${lang}.txt`), out = path.join(OUT, `promo-${lang}.mp4`);
    fs.writeFileSync(list, queue.filter(p => p.lang === lang).map(p => `file '${p.out}'`).join('\n'));
    const audio = path.join(__dirname, 'audio', 'score.wav');
    const r = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list, ...(fs.existsSync(audio) ? ['-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []), '-c:v', 'copy', '-movflags', '+faststart', out], { stdio: 'ignore' });
    console.log(r.status === 0 ? 'wrote ' + out : 'join failed for ' + lang);
  }
  console.log(`done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
})().catch(e => { console.error(e.message); process.exit(1); });
