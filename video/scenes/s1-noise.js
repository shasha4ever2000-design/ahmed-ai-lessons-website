// s1 · Noise (6 s). Darkness full of restless cold shards and glitching scan lines, lit by a harsh
// flickering white light. Words: copy.s1[0] at ~0.8 s, copy.s1[1] at ~3 s. Ends in a near white-out
// that hands over (same shards, same camera path) to s2.
import { line } from '../lib/type.js';
import { clamp, ease, range } from '../lib/util.js';
import { panelData, makeShards, applyCam, hash, band as scrim } from '../lib/s1-opening.js';

export default {
  id: 's1-noise', duration: 6, fadeIn: 0, fadeOut: 0,
  bloom: { strength: 1.0, radius: 0.5, threshold: 0.62 },
  async setup({ THREE, rng, copy, lang }) {
    const scene = new THREE.Scene();
    const bg = new THREE.Color('#030405'); scene.background = bg;
    const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 80);

    const pd = panelData(THREE);
    const shards = makeShards(THREE, rng, pd);
    scene.add(shards.mesh);

    // Glitch lines: thin bright bars that tear across the dark.
    const NL = 110, r = rng(9001);
    const lines = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), NL);
    lines.frustumCulled = false; lines.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const L = Array.from({ length: NL }, () => ({ y: -0.5 + r() * 7.5, z: -3 + r() * 9, x0: (r() - 0.5) * 24, v: (r() < 0.5 ? -1 : 1) * (5 + r() * 14), len: 1.5 + Math.pow(r(), 2) * 11, th: 0.02 + Math.pow(r(), 3) * 0.03, rate: 8 + r() * 14, p: r(), cy: r() < 0.25 }));
    const dummy = new THREE.Object3D(), col = new THREE.Color();
    for (let i = 0; i < NL; i++) lines.setColorAt(i, col.setRGB(0, 0, 0));
    scene.add(lines);

    // The harsh light source, deep in the dark (it becomes the window in s2).
    const glowMat = new THREE.ShaderMaterial({
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: { uI: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform float uI; varying vec2 vUv; void main(){ vec2 d = (vUv - 0.5) * vec2(1.0, 1.25); float r = length(d);
        float g = exp(-r * r * 60.0) * 1.6 + exp(-r * 11.0) * 0.22; gl_FragColor = vec4(vec3(0.86, 0.92, 1.0) * g * uI, 1.0); }`,
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), glowMat);
    glow.position.set(0, 3.0, -5); scene.add(glow);

    // Harsh, irregular strobe as a pure function of t.
    const strobe = t => {
      const f = Math.floor(t * 24), base = 0.35 + 0.25 * Math.sin(t * 3.1) * Math.sin(t * 7.7);
      const hit = hash(f, 3) > 0.84 - 0.25 * range(t, 3.5, 6) ? 0.9 + hash(f, 4) * 1.4 : 0;
      const drop = hash(f, 5) > 0.93 ? -0.3 : 0;
      return clamp(base + hit + drop, 0.05, 3) * range(t, 0, 0.25) + range(t, 4.6, 6) * 2.2;
    };

    // Words, drawn once per frame into a band, then torn into slices for the glitch.
    const band = document.createElement('canvas'); band.width = 1920; band.height = 260;
    const bg2 = band.getContext('2d'); bg2.lang = lang;
    const glitchLine = (g, text, t, tin, tout, y) => {
      if (t < tin - 0.05 || t > tout + 0.7) return;
      bg2.setTransform(1, 0, 0, 1, 0, 0); bg2.clearRect(0, 0, 1920, 260);
      line(bg2, { text, x: 960, y: 160, size: lang === 'ar' ? 82 : 78, t, in: tin, out: tout, dur: 0.55, outDur: 0.45, style: 'fade', color: '#eef3f8', glow: 18, glowColor: 'rgba(200,225,255,0.55)', letter: 1 });
      const f = Math.floor(t * 20);
      const near = Math.min(Math.abs(t - tin), Math.abs(t - tout - 0.2));
      const tear = hash(f, 11) < (near < 0.45 ? 0.7 : 0.2);
      const top = y - 160;
      if (!tear) { g.drawImage(band, 0, top); return; }
      // RGB split ghost, then horizontal slices with offsets.
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35;
      const sx = (hash(f, 12) - 0.5) * 30;
      g.drawImage(band, sx, top); g.drawImage(band, -sx * 0.7, top + 2); g.restore();
      const n = 5 + Math.floor(hash(f, 13) * 6); let yy = 0;
      for (let i = 0; i < n && yy < 260; i++) {
        const h = i === n - 1 ? 260 - yy : Math.min(260 - yy, Math.max(6, Math.floor(hash(f, 20 + i) * (260 / n) * 1.8)));
        const off = hash(f, 40 + i) > 0.55 ? (hash(f, 60 + i) - 0.5) * 70 : 0;
        g.drawImage(band, 0, yy, 1920, h, off, top + yy, 1920, h); yy += h;
      }
    };

    return {
      scene, camera,
      update(t) {
        applyCam(camera, t);
        const S = strobe(t);
        const bgk = 0.18 * S * S;
        bg.setRGB(0.004 + 0.02 * bgk, 0.005 + 0.022 * bgk, 0.007 + 0.026 * bgk);
        const u = shards.material.uniforms;
        u.uL.value.set(Math.sin(t * 0.9) * 4, 6 + Math.sin(t * 1.3) * 2, 6);
        u.uLc.value.setRGB(0.85 * (0.3 + S), 0.92 * (0.3 + S), 1.0 * (0.3 + S));
        u.uAmb.value = 0.05 + 0.05 * S;
        shards.update(t, camera.position);
        glowMat.uniforms.uI.value = 0.12 + S * S * 0.3;
        // Lines: on/off in bursts, more of them as the noise builds.
        const busy = 0.32 + 0.4 * range(t, 3.5, 6);
        for (let i = 0; i < NL; i++) {
          const l = L[i], f = Math.floor(t * l.rate + l.p * 10), on = hash(i, f) < busy * 0.55;
          let x = l.x0 + l.v * t; x = ((x + 14) % 28 + 28) % 28 - 14;
          dummy.position.set(x, l.y + (hash(i, f + 0.3) - 0.5) * 0.2, l.z);
          dummy.scale.set(l.len * (0.5 + hash(i, f + 0.7)), l.th, l.th);
          dummy.updateMatrix(); lines.setMatrixAt(i, dummy.matrix);
          const b = on ? (0.5 + hash(i, f + 0.9) * 1.6) * (0.5 + 0.5 * S) : 0;
          if (l.cy) lines.setColorAt(i, col.setRGB(b * 0.55, b * 0.85, b)); else lines.setColorAt(i, col.setRGB(b, b, b));
        }
        lines.instanceMatrix.needsUpdate = true; lines.instanceColor.needsUpdate = true;
        return { bloom: { strength: 0.85 + 0.6 * range(t, 4.2, 6), radius: 0.5 + 0.2 * range(t, 4.5, 6), threshold: 0.62 - 0.3 * range(t, 4.5, 6) }, vignette: 1.0 - 0.4 * range(t, 4.5, 6) };
      },
      overlay(g, t) {
        scrim(g, { y: 540, h: 380, alpha: 0.42 * range(t, 0.6, 1.2) * (1 - range(t, 5.2, 5.8)), color: '2,3,5' });
        glitchLine(g, copy.s1[0], t, 0.8, 2.45, 560);
        glitchLine(g, copy.s1[1], t, 3.0, 5.2, 560);
        // Toward the cut the light swallows everything (s2 opens on the same white).
        const w = ease.in(range(t, 4.9, 6)) * 0.88;
        if (w > 0) { g.save(); g.globalAlpha = w; g.fillStyle = '#eef3f8'; g.fillRect(0, 0, 1920, 1080); g.restore(); }
      },
    };
  },
};
