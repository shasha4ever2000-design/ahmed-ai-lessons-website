// s4 — "The 4-part prompt". A dark room behind a carved 8-point-star lattice wall. Four star gems
// (Role / Task / Context / Format) ignite one by one; with each beat the light behind the lattice
// rises (25 → 50 → 75 → 100 %), the floor fills with star-shaped light and the room warms up.
import { panelShape, starPts } from '../lib/patterns.js';
import { line } from '../lib/type.js';
import { clamp, lerp, range, ease, C } from '../lib/util.js';
import { starGemGeometry, glowTexture, ringTexture, warmEnv } from '../lib/s4-gem.js';

const PART_COLORS = [C.role, C.task, C.context, C.format];
const IGNITE = [1.9, 3.15, 4.4, 5.65];
const FLOOR_Y = -1.75, WALL_Z = -3.6;
// A soft dark band across the full 1920-wide design space (lib scrim() uses device width).
function band(g, y, h, alpha) {
  const grd = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  grd.addColorStop(0, 'rgba(8,5,3,0)'); grd.addColorStop(0.5, `rgba(8,5,3,${alpha})`); grd.addColorStop(1, 'rgba(8,5,3,0)');
  g.fillStyle = grd; g.fillRect(0, y - h / 2, 1920, h);
}

export default {
  id: 's4-prompt', duration: 9,
  bloom: { strength: 0.8, radius: 0.55, threshold: 0.7 },
  async setup({ THREE, renderer, lang, copy, rng }) {
    const ar = lang === 'ar';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0604');
    scene.fog = new THREE.Fog('#0a0604', 9, 22);
    const env = warmEnv(THREE, renderer);
    const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 60);

    // ---- light source behind the lattice: a big glowing plane, brighter in the middle.
    const sunC = document.createElement('canvas'); sunC.width = 512; sunC.height = 256;
    { const g = sunC.getContext('2d'); const grd = g.createRadialGradient(256, 150, 10, 256, 150, 300);
      grd.addColorStop(0, '#ffe2b0'); grd.addColorStop(0.3, '#ffbf6a'); grd.addColorStop(0.7, '#d97a22'); grd.addColorStop(1, '#4a220a');
      g.fillStyle = grd; g.fillRect(0, 0, 512, 256); }
    const sunTex = new THREE.CanvasTexture(sunC); sunTex.colorSpace = THREE.SRGBColorSpace;
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex, color: new THREE.Color(0, 0, 0), fog: false });
    const sun = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), sunMat);
    sun.position.set(0, 2.2, WALL_Z - 0.9); scene.add(sun);

    // ---- the carved lattice wall (8-point stars), extruded once.
    const wallGeo = new THREE.ExtrudeGeometry(panelShape(THREE, 'ai', 14, 11, 0.0128, 4), { depth: 0.22, bevelEnabled: false, curveSegments: 1 });
    wallGeo.translate(0, 0, -0.22);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#3b2516', roughness: 0.72, metalness: 0.0, envMap: env, envMapIntensity: 0.15 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 1.9, WALL_Z); scene.add(wall);

    // ---- a deep pointed-arch opening in a plain wall frames the lattice (one clear window of light).
    const AW = 4.1, SPR = 2.5, AH = 2.7;
    const outer = new THREE.Shape(); outer.moveTo(-20, FLOOR_Y - 1); outer.lineTo(20, FLOOR_Y - 1); outer.lineTo(20, 14); outer.lineTo(-20, 14); outer.closePath();
    const arch = new THREE.Path();
    arch.moveTo(-AW, FLOOR_Y - 1); arch.lineTo(-AW, SPR);
    arch.bezierCurveTo(-AW, SPR + AH * 0.62, -AW * 0.42, SPR + AH * 0.9, 0, SPR + AH);
    arch.bezierCurveTo(AW * 0.42, SPR + AH * 0.9, AW, SPR + AH * 0.62, AW, SPR);
    arch.lineTo(AW, FLOOR_Y - 1); arch.closePath();
    outer.holes.push(arch);
    const archGeo = new THREE.ExtrudeGeometry(outer, { depth: 0.7, bevelEnabled: false, curveSegments: 24 });
    const archMat = new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.85, envMap: env, envMapIntensity: 0.1 });
    const archWall = new THREE.Mesh(archGeo, archMat); archWall.position.z = WALL_Z + 0.05; scene.add(archWall);

    // ---- floor: dark polished stone + an additive layer of star-shaped light pools.
    const floorMat = new THREE.MeshStandardMaterial({ color: '#1a110b', roughness: 0.42, metalness: 0.0, envMap: env, envMapIntensity: 0.25 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR_Y, 4); scene.add(floor);

    // Star pools: the lattice pattern cast long across the floor, fading toward the camera.
    const PW = 11, PD = 9.5; // world size of the pool layer (x, z)
    const poolC = document.createElement('canvas'); poolC.width = 2048; poolC.height = 1024;
    {
      const g = poolC.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 2048, 1024);
      const sx = 2048 / PW, sz = 1024 / PD, tileW = 56 * 0.0128 * 1.35; // pools slightly larger than the holes
      g.filter = 'blur(5px)';
      for (let row = 0; row < 14; row++) {
        const z = 0.25 + row * tileW * 1.55;               // distance from the wall (world)
        const fade = Math.pow(Math.max(0, 1 - z / PD), 1.4);
        if (fade <= 0) continue;
        const stretch = 1.55 + row * 0.05;
        for (let col = -9; col <= 9; col++) {
          const x = col * tileW;
          const cx = (x + PW / 2) * sx, cy = z * sz;
          const edge = clamp(1 - Math.abs(x) / (PW / 2)); const a = fade * Math.pow(edge, 0.7);
          if (a < 0.02) continue;
          g.save(); g.translate(cx, cy); g.scale(1, stretch);
          const pts = starPts(0, 0, 8, tileW * 0.34 * sx, tileW * 0.22 * sx, -90 + 11.25);
          g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath();
          g.fillStyle = `rgba(255,${Math.round(196 + 30 * fade)},${Math.round(120 + 60 * fade)},${a})`; g.fill();
          g.restore();
        }
      }
      g.filter = 'blur(40px)';
      const grd = g.createLinearGradient(0, 0, 0, 1024); grd.addColorStop(0, 'rgba(255,170,80,0.35)'); grd.addColorStop(0.6, 'rgba(255,140,60,0.08)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = grd; g.fillRect(-100, -100, 2248, 1224);
    }
    const poolTex = new THREE.CanvasTexture(poolC); poolTex.colorSpace = THREE.SRGBColorSpace; poolTex.anisotropy = 8;
    const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, color: new THREE.Color(0, 0, 0), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), poolMat);
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, FLOOR_Y + 0.005, WALL_Z + PD / 2); scene.add(pool);

    // ---- light shafts: soft slanted sheets from the lattice down to the floor (additive).
    const shaftC = document.createElement('canvas'); shaftC.width = 256; shaftC.height = 512;
    {
      const g = shaftC.getContext('2d'), r = rng(44);
      for (let i = 0; i < 26; i++) {
        const x = 10 + r() * 236, w = 4 + r() * 18, a = 0.10 + r() * 0.22;
        const grd = g.createLinearGradient(0, 0, 0, 512); grd.addColorStop(0, `rgba(255,214,150,${a})`); grd.addColorStop(0.7, `rgba(255,190,110,${a * 0.4})`); grd.addColorStop(1, 'rgba(255,170,80,0)');
        g.fillStyle = grd; g.filter = `blur(${3 + r() * 6}px)`; g.fillRect(x, 0, w, 512);
      }
      g.filter = 'none'; g.globalCompositeOperation = 'destination-in';
      const m = g.createLinearGradient(0, 0, 256, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.2, '#000'); m.addColorStop(0.8, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = m; g.fillRect(0, 0, 256, 512);
    }
    const shaftTex = new THREE.CanvasTexture(shaftC); shaftTex.colorSpace = THREE.SRGBColorSpace;
    const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex, color: new THREE.Color(0, 0, 0), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), shaftMat);
      // from high on the wall, sloping toward the camera and down to the floor
      m.position.set((i - 1) * 0.5, 0.9, WALL_Z + 1.5 + i * 0.25);
      m.rotation.set(-1.12 - i * 0.06, 0, 0);
      scene.add(m);
    }

    // ---- dust motes drifting in the light (positions are a pure function of t).
    const NM = 260, r = rng(7), mBase = [];
    for (let i = 0; i < NM; i++) mBase.push([(r() - 0.5) * 12, r() * 5.5 + FLOOR_Y, WALL_Z + 0.4 + r() * 6.5, 0.04 + r() * 0.08, r() * 6.28]);
    const motePos = new Float32Array(NM * 3);
    const moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const glowTex = glowTexture(THREE);
    const moteMat = new THREE.PointsMaterial({ map: glowTex, size: 0.045, color: new THREE.Color('#ffd9a0'), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    const motes = new THREE.Points(moteGeo, moteMat); motes.frustumCulled = false; scene.add(motes);

    // ---- room light: dim bounce that grows with the light level; a back light that rims the carving.
    const hemi = new THREE.HemisphereLight('#ffcf94', '#2a160a', 0.08); scene.add(hemi);
    const back = new THREE.DirectionalLight('#ffbe6e', 0); back.position.set(0, 4, WALL_Z - 6); back.target.position.set(0, 0, 3); scene.add(back, back.target);
    const front = new THREE.PointLight('#ffb466', 0, 16, 1.6); front.position.set(0, 3.2, 3.5); scene.add(front);

    // ---- the four gems.
    const gemGeo = starGemGeometry(THREE);
    const ringTex = ringTexture(THREE);
    const order = ar ? [3, 2, 1, 0] : [0, 1, 2, 3]; // reading order: Role first (right-most in Arabic)
    const XS = [-3.15, -1.05, 1.05, 3.15];
    const gems = PART_COLORS.map((hex, i) => {
      const col = new THREE.Color(hex);
      const grp = new THREE.Group(); grp.position.set(XS[order.indexOf(i)], 0.35, 0.6); scene.add(grp);
      const mat = new THREE.MeshPhysicalMaterial({ color: col.clone().multiplyScalar(0.35), metalness: 0.75, roughness: 0.2, clearcoat: 0.35, clearcoatRoughness: 0.12,
        flatShading: true, envMap: env, envMapIntensity: 0.6, emissive: col.clone(), emissiveIntensity: 0 });
      const gem = new THREE.Mesh(gemGeo, mat); grp.add(gem);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col.clone(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, fog: false }));
      halo.position.z = -0.25; grp.add(halo);
      const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, color: col.clone().lerp(new THREE.Color('#fff'), 0.15), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, fog: false }));
      grp.add(ring);
            const pud = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshBasicMaterial({ map: glowTex, color: new THREE.Color(0, 0, 0), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
      pud.rotation.x = -Math.PI / 2; pud.position.set(grp.position.x, FLOOR_Y + 0.01, grp.position.z + 0.1); scene.add(pud);
      return { grp, gem, mat, halo, ring, pud, col, i };
    });

    const L = t => 0.03 + IGNITE.reduce((s, ti) => s + 0.2425 * ease.out(range(t, ti, ti + 0.8)), 0);
    const pct = t => Math.round(IGNITE.reduce((s, ti) => s + 25 * ease.inOut(range(t, ti + 0.05, ti + 0.6)), 0));
    const screen = [];
    const v3 = new THREE.Vector3();
    const labelCol = PART_COLORS.map(h => new THREE.Color(h).lerp(new THREE.Color('#ffffff'), 0.28).getStyle());

    return {
      scene, camera,
      update(t) {
        const k = t / 9, lv = L(t);
        // Camera: a slow confident push and rise, a hint of lateral drift.
        const cp = ease.inOut(clamp(k));
        camera.position.set(lerp(-0.35, 0.25, cp), lerp(0.75, 1.0, cp), lerp(11.2, 9.4, cp));
        camera.lookAt(lerp(-0.1, 0.05, cp), lerp(0.85, 1.0, cp), 0);
        camera.updateMatrixWorld();

        // Room light follows the level.
        const lit = Math.pow(lv, 1.15);
        sunMat.color.setRGB(1, 1, 1).multiplyScalar(0.1 + 0.8 * lit);
        poolMat.color.setRGB(1, 1, 1).multiplyScalar(0.9 * lit);
        shaftMat.color.setRGB(1, 1, 1).multiplyScalar(0.16 * lit);
        hemi.intensity = 0.03 + 0.14 * lit;
        back.intensity = 0.2 + 2.4 * lit;
        front.intensity = 1.1 * lit;
        wallMat.envMapIntensity = 0.06 + 0.22 * lit; archMat.envMapIntensity = 0.05 + 0.25 * lit;
        floorMat.envMapIntensity = 0.1 + 0.3 * lit;
        moteMat.opacity = 0.15 + 0.85 * lit;
        scene.fog.color.setRGB(0.035 + 0.05 * lit, 0.022 + 0.027 * lit, 0.014 + 0.012 * lit);
        scene.background.copy(scene.fog.color);
        for (let i = 0; i < NM; i++) {
          const [x, y, z, sp, ph] = mBase[i];
          motePos[i * 3] = x + Math.sin(t * 0.3 + ph) * 0.25;
          motePos[i * 3 + 1] = FLOOR_Y + ((y - FLOOR_Y + t * sp) % 5.5);
          motePos[i * 3 + 2] = z + Math.cos(t * 0.25 + ph) * 0.2;
        }
        moteGeo.attributes.position.needsUpdate = true;

        // Gems: dormant glass until their beat, then a pop, an eighth-turn and a ring of light.
        let flashSum = 0;
        for (const G of gems) {
          const ti = IGNITE[G.i], on = range(t, ti, ti + 0.5), dt = t - ti;
          const flash = dt > 0 ? Math.exp(-dt * 5) : 0; flashSum += flash;
          const pop = dt > 0 ? 1 + 0.22 * Math.exp(-dt * 4.5) * Math.sin(dt * 9 + 0.6) + 0.12 * ease.out(on) : 1;
          const idle = Math.sin(t * 0.8 + G.i * 1.3);
          G.grp.position.y = 0.35 + idle * 0.05 + 0.08 * ease.out(on);
          G.gem.scale.setScalar(0.52 * pop);
          G.gem.rotation.set(0.18 + idle * 0.05, Math.sin(t * 0.6 + G.i) * 0.32, (Math.PI / 4) * ease.out(range(t, ti, ti + 0.9)) + t * 0.05);
          G.mat.emissiveIntensity = 0.02 + 0.5 * ease.out(on) + 1.0 * flash;
          G.mat.color.copy(G.col).multiplyScalar(0.3 + 0.7 * on);
          G.halo.material.opacity = 0.03 + 0.3 * ease.out(on) + 0.5 * flash;
          G.halo.scale.setScalar(1.8 + 0.5 * ease.out(on) + 1.0 * flash);
          const rk = range(t, ti, ti + 1.1);
          G.ring.material.opacity = rk > 0 && rk < 1 ? 0.7 * Math.pow(1 - rk, 1.5) : 0;
          G.ring.scale.setScalar(0.8 + 2.4 * ease.out(rk));
          G.pud.material.color.copy(G.col).multiplyScalar(0.55 * ease.out(on) + 0.6 * flash);
          G.grp.updateMatrixWorld(); v3.setFromMatrixPosition(G.grp.matrixWorld).project(camera);
          screen[G.i] = [(v3.x + 1) * 960, (1 - v3.y) * 540];
        }
        return { bloom: { strength: 0.6 + 0.1 * lit + 0.35 * Math.min(1, flashSum), radius: 0.32 + 0.08 * lit, threshold: 0.84 }, vignette: lerp(1.0, 0.75, lit) };
      },
      overlay(g, t) {
        const lv = L(t);
        // Headline, top.
        band(g, 200, 340, (0.5 + 0.25 * lv) * range(t, 0.2, 1));
        line(g, { text: copy.s4.h[0], x: 960, y: 168, size: ar ? 46 : 44, font: 'body', weight: 400, color: C.text2, t, in: 0.35, dur: 1.0 });
        line(g, { text: copy.s4.h[1], x: 960, y: 252, size: ar ? 72 : 70, color: C.cream, t, in: 0.8, dur: 1.1, glow: 18, glowColor: 'rgba(255,190,110,0.35)' });

        // Gem labels.
        for (let i = 0; i < 4; i++) {
          const s = screen[i]; if (!s) continue;
          const ti = IGNITE[i], on = ease.out(range(t, ti + 0.05, ti + 0.55));
          const a = range(t, 0.9, 1.6) * (0.38 + 0.62 * on);
          g.save(); g.globalAlpha = a; g.font = '600 46px Messiri'; g.textAlign = 'center'; g.direction = ar ? 'rtl' : 'ltr';
          g.shadowColor = 'rgba(6,3,1,0.95)'; g.shadowBlur = 22; g.fillStyle = 'rgba(6,3,1,0.55)'; g.fillText(copy.s4.parts[i], s[0], s[1] + 182);
          g.shadowColor = PART_COLORS[i]; g.shadowBlur = 16 * on; g.fillStyle = on > 0.5 ? labelCol[i] : C.muted; g.fillText(copy.s4.parts[i], s[0], s[1] + 182);
          g.restore();
          g.save(); g.globalAlpha = a; g.fillStyle = PART_COLORS[i];
          g.beginPath(); g.arc(s[0], s[1] + 124, 4 + 2 * on, 0, Math.PI * 2); g.fill(); g.restore();
        }

        // Counter: big % + copy, and four segments filling in the part colours.
        const n = pct(t), aC = range(t, 1.6, 2.1);
        if (aC > 0) {
          band(g, 950, 210, (0.45 + 0.3 * lv) * aC);
          g.save(); g.globalAlpha = aC;
          const num = `${n}%`;
          g.font = '600 84px Messiri'; const nw = g.measureText('100%').width;
          g.font = `400 ${ar ? 42 : 40}px Plex`; g.direction = ar ? 'rtl' : 'ltr'; const tw = g.measureText(copy.s4.light).width;
          const gap = 26, total = nw + gap + tw, x0 = 960 - total / 2;
          const yb = 960;
          // number in a fixed slot so the line does not jump while counting
          g.direction = 'ltr'; g.font = '600 84px Messiri'; g.fillStyle = '#ffd79a'; g.shadowColor = 'rgba(255,170,70,0.6)'; g.shadowBlur = 24 * lv;
          if (!ar) { g.textAlign = 'right'; g.fillText(num, x0 + nw, yb); }
          else { g.textAlign = 'left'; g.fillText(num, x0 + tw + gap, yb); }
          g.shadowBlur = 0; g.font = `400 ${ar ? 42 : 40}px Plex`; g.fillStyle = C.cream; g.direction = ar ? 'rtl' : 'ltr';
          if (!ar) { g.textAlign = 'left'; g.fillText(copy.s4.light, x0 + nw + gap, yb - 6); }
          else { g.textAlign = 'right'; g.fillText(copy.s4.light, x0 + tw, yb - 6); }
          const sw = 92, sg = 10, sx0 = 960 - (4 * sw + 3 * sg) / 2, sy = 1000;
          for (let i = 0; i < 4; i++) {
            const idx = ar ? 3 - i : i, f = ease.inOut(range(t, IGNITE[idx] + 0.05, IGNITE[idx] + 0.6));
            const x = sx0 + i * (sw + sg);
            g.fillStyle = 'rgba(243,236,227,0.16)'; g.fillRect(x, sy, sw, 5);
            g.fillStyle = PART_COLORS[idx];
            if (!ar) g.fillRect(x, sy, sw * f, 5); else g.fillRect(x + sw * (1 - f), sy, sw * f, 5);
          }
          g.restore();
        }
      },
    };
  },
};
