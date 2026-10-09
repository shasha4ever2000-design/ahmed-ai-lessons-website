// Renders the film to video, frame by frame (deterministic), or single stills for checking.
//   node video/render.cjs --lang en --out video/out/promo-en.mp4 [--w 1920 --h 1080 --fps 30 --from 0 --to 48]
//   node video/render.cjs --lang ar --stills 1,7.5,20 --w 960 --h 540      (writes video/out/still-<lang>-<t>.png)
//   node video/render.cjs --sheet 2 --w 640 --h 360 --lang en              (contact sheet: one frame every 2 s)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn, spawnSync } = require('child_process');
const path = require('path'), fs = require('fs');
const a = Object.fromEntries(process.argv.slice(2).reduce((m, v, i, arr) => (v.startsWith('--') ? [...m, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : '1']] : m), []));
const W = +(a.w || 1920), H = +(a.h || 1080), fps = +(a.fps || 30), lang = a.lang || 'en', port = +(a.port || 4400);
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.cjs'), String(port)], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 400));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://localhost:${port}/video/index.html?w=${W}&h=${H}&lang=${lang}`);
  const info = await page.evaluate(() => window.film.ready);
  const shoot = async t => { await page.evaluate(t => window.film.renderAt(t), t); return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } }); };
  try {
    if (a.stills) {
      for (const t of a.stills.split(',').map(Number)) { const f = path.join(OUT, `still-${lang}-${t}.png`); fs.writeFileSync(f, await shoot(t)); console.log('wrote', f); }
    } else if (a.sheet) {
      const step = +a.sheet, files = [];
      for (let t = 0.25; t < info.duration; t += step) { const f = path.join(OUT, `sheet-${lang}-${t.toFixed(2)}.png`); fs.writeFileSync(f, await shoot(t)); files.push(f); }
      const cols = 4, out = path.join(OUT, `sheet-${lang}.png`);
      const r = spawnSync('ffmpeg', ['-y', ...files.flatMap(f => ['-i', f]), '-filter_complex', `${files.map((_, i) => `[${i}:v]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) ? Array.from({ length: i % cols }, () => 'w0').join('+') : '0'}_${Math.floor(i / cols) ? Array.from({ length: Math.floor(i / cols) }, () => 'h0').join('+') : '0'}`).join('|')}:fill=black`, out], { stdio: 'ignore' });
      files.forEach(f => fs.unlinkSync(f));
      console.log(r.status === 0 ? 'wrote ' + out : 'sheet failed');
    } else {
      const from = +(a.from || 0), to = Math.min(+(a.to || info.duration), info.duration), out = a.out || path.join(OUT, `promo-${lang}.mp4`);
      const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
      const n = Math.round((to - from) * fps), t0 = Date.now();
      for (let i = 0; i < n; i++) {
        const buf = await shoot(from + i / fps);
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        if (i % 30 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000 / (i + 1)).toFixed(2)} s/frame`);
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r));
      // Add the soundtrack (same length as the film) when there is one.
      const audio = a.audio || path.join(__dirname, 'audio', 'score.wav');
      if (!a.silent && fs.existsSync(audio) && from === 0) {
        const tmp = out.replace(/\.mp4$/, '.tmp.mp4'); fs.renameSync(out, tmp);
        const r = spawnSync('ffmpeg', ['-y', '-i', tmp, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: 'ignore' });
        if (r.status === 0) fs.unlinkSync(tmp); else fs.renameSync(tmp, out);
      }
      console.log('wrote', out);
    }
  } finally {
    if (errors.length) console.log('PAGE ERRORS:\n' + [...new Set(errors)].join('\n'));
    await browser.close(); server.kill();
  }
})();
