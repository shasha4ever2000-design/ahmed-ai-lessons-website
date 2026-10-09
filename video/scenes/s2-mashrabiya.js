// s2 · Mashrabiya (8 s). The noise from s1 slows, warms and flies into a deep window, assembling a carved
// 8-point-star mashrabiya from the centre out. The harsh white light behind turns amber and pours through
// the holes: star-shaped shafts and light pools on the floor. Slow camera push. Words: copy.s2.
import { line } from '../lib/type.js';
import { clamp, ease, range, lerp } from '../lib/util.js';
import { PANEL, SUN, panelData, makeShards, applyCam, revealAt, revealGLSL, toFloor, band } from '../lib/s1-opening.js';

export default {
  id: 's2-mashrabiya', duration: 8, fadeIn: 0,
  bloom: { strength: 0.6, radius: 0.45, threshold: 0.8 },
  async setup({ THREE, rng, copy, lang }) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050302');
    const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 80);
    const side = lang === 'ar' ? -1 : 1;
    const pd = panelData(THREE), { hw, hh } = pd, cy = PANEL.cy, D = PANEL.depth, BV = 0.012;
    const AMBER = new THREE.Color('#f2a33a'), HOT = new THREE.Color('#ffd79a'), COLD = new THREE.Color('#e6eeff');

    // --- The carved panel, materialising from the centre out (shader reveal with a hot edge).
    const pgeo = new THREE.ExtrudeGeometry(pd.shape, { depth: D, bevelEnabled: true, bevelThickness: BV, bevelSize: 0.008, bevelSegments: 1, curveSegments: 1 });
    pgeo.translate(0, 0, -D / 2);
    const pmat = new THREE.MeshStandardMaterial({ color: '#5a3820', roughness: 0.58, metalness: 0.0 });
    const uRev = { value: 0 };
    pmat.onBeforeCompile = sh => {
      sh.uniforms.uRevT = uRev;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc; uniform float uRevT;' + revealGLSL(hw, hh))
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          float rr = uRevT - revealAt(vLoc.xy); if (rr < 0.0) discard;
          float edge = 1.0 - smoothstep(0.0, 0.5, rr); totalEmissiveRadiance += vec3(1.0, 0.5, 0.16) * edge * edge * 5.0;`);
    };
    const panel = new THREE.Mesh(pgeo, pmat); panel.position.set(0, cy, 0); scene.add(panel);

    // --- A deep window in a dark plaster wall.
    const g2 = 0.015, wl = -hw - g2, wr = hw + g2, wb = cy - hh - g2, wt = cy + hh + g2;
    const wshape = new THREE.Shape([new THREE.Vector2(-16, -0.5), new THREE.Vector2(16, -0.5), new THREE.Vector2(16, 14), new THREE.Vector2(-16, 14)]);
    wshape.holes.push(new THREE.Path([new THREE.Vector2(wl, wb), new THREE.Vector2(wl, wt), new THREE.Vector2(wr, wt), new THREE.Vector2(wr, wb)]));
    const wgeo = new THREE.ExtrudeGeometry(wshape, { depth: 0.7, bevelEnabled: false }); wgeo.translate(0, 0, -0.35);
    const wall = new THREE.Mesh(wgeo, new THREE.MeshStandardMaterial({ color: '#3a2a1f', roughness: 0.95 }));
    scene.add(wall);

    // --- What's behind the screen: the sky/sun, cold and harsh, then warm.
    const skyMat = new THREE.ShaderMaterial({
      uniforms: { uWarm: { value: 0 }, uI: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform float uWarm, uI; varying vec2 vUv; void main(){
        float sun = exp(-length((vUv - vec2(0.66, 0.9)) * vec2(1.0, 0.8)) * 2.4);
        vec3 cold = vec3(0.92, 0.96, 1.0) * 3.0;
        vec3 warm = mix(vec3(1.0, 0.36, 0.07) * 1.1, vec3(1.0, 0.66, 0.30) * 2.1, sun);
        vec3 c = mix(cold * (0.75 + 0.4 * sun), warm, uWarm);
        gl_FragColor = vec4(c * uI, 1.0); }`,
    });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(10, 9), skyMat); sky.position.set(0, cy, -1.6); scene.add(sky);

    // --- Light pools on the floor: the holes projected from the sun (baked once into a texture).
    const FX0 = -6, FX1 = 6, FZ0 = -0.4, FZ1 = 7.6, PX = 100, TW = (FX1 - FX0) * PX, TH = (FZ1 - FZ0) * PX;
    const mk = () => { const c = document.createElement('canvas'); c.width = TW; c.height = TH; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, TW, TH); return [c, x]; };
    const fp = (x, y) => { const q = toFloor(x, y + cy, 0); return [(q[0] - FX0) * PX, (q[2] - FZ0) * PX]; };
    const [cCov, xCov] = mk(), [cRev, xRev] = mk(), [cRect, xRect] = mk(), [cOut, xOut] = mk();
    const holeRev = pd.holes.map(h => { const cx = h.reduce((s, p) => s + p[0], 0) / h.length, cyy = h.reduce((s, p) => s + p[1], 0) / h.length; return revealAt(cx, cyy, hw, hh); });
    pd.holes.forEach((h, i) => {
      const pts = h.map(p => fp(p[0], p[1]));
      xCov.fillStyle = '#fff'; xCov.beginPath(); pts.forEach((p, k) => (k ? xCov.lineTo(...p) : xCov.moveTo(...p))); xCov.closePath(); xCov.fill();
      const v = Math.round(clamp(holeRev[i] / 8) * 255);
      xRev.fillStyle = xRev.strokeStyle = `rgb(${v},${v},${v})`; xRev.lineWidth = 14; xRev.lineJoin = 'round';
      xRev.beginPath(); pts.forEach((p, k) => (k ? xRev.lineTo(...p) : xRev.moveTo(...p))); xRev.closePath(); xRev.fill(); xRev.stroke();
    });
    { const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(p => fp(...p)); xRect.fillStyle = '#fff'; xRect.beginPath(); pts.forEach((p, k) => (k ? xRect.lineTo(...p) : xRect.moveTo(...p))); xRect.closePath(); xRect.fill(); }
    const blur = (c, px) => { const [o, x] = mk(); x.filter = `blur(${px}px)`; x.drawImage(c, 0, 0); return o; };
    const covB = blur(cCov, 2.5).getContext('2d').getImageData(0, 0, TW, TH).data;
    const revD = xRev.getImageData(0, 0, TW, TH).data, rectB = blur(cRect, 6).getContext('2d').getImageData(0, 0, TW, TH).data;
    const out = xOut.createImageData(TW, TH);
    for (let i = 0; i < out.data.length; i += 4) { out.data[i] = revD[i]; out.data[i + 1] = covB[i]; out.data[i + 2] = rectB[i]; out.data[i + 3] = 255; }
    xOut.putImageData(out, 0, 0);
    const poolTex = new THREE.CanvasTexture(cOut); poolTex.flipY = false; poolTex.colorSpace = THREE.NoColorSpace;
    poolTex.minFilter = THREE.LinearMipmapLinearFilter; poolTex.anisotropy = 4;
    const floorMat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: poolTex }, uT: { value: 0 }, uPool: { value: 0 }, uRect: { value: 1 }, uPoolC: { value: new THREE.Color() }, uRectC: { value: new THREE.Color() }, uAmb: { value: 0 } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform sampler2D uTex; uniform float uT, uPool, uRect, uAmb; uniform vec3 uPoolC, uRectC; varying vec3 vW;
        float hsh(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(hsh(i), hsh(i+vec2(1,0)), f.x), mix(hsh(i+vec2(0,1)), hsh(i+vec2(1,1)), f.x), f.y); }
        void main(){
          vec2 uv = vec2((vW.x - ${FX0.toFixed(2)}) / ${(FX1 - FX0).toFixed(2)}, (vW.z - ${FZ0.toFixed(2)}) / ${(FZ1 - FZ0).toFixed(2)});
          vec4 tx = (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) ? texture2D(uTex, uv) : vec4(0.0);
          float rev = tx.r * 8.0; float on = smoothstep(rev, rev + 0.9, uT);
          float stone = 0.75 + 0.25 * vn(vW.xz * 3.0) + 0.1 * vn(vW.xz * 17.0);
          float near = exp(-pow(length(vec2(vW.x * 0.5, vW.z - 1.6)) * 0.42, 2.0));
          vec3 c = vec3(0.020, 0.013, 0.009) * stone * (0.5 + near);
          c += uAmb * vec3(1.0, 0.55, 0.22) * near * 0.06 * stone;
          c += uPoolC * tx.g * on * uPool * stone;
          c += uRectC * tx.b * uRect * stone;
          gl_FragColor = vec4(c, 1.0); }`,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 10); scene.add(floor);

    // --- Light shafts: one soft additive frustum per hole, from the hole to its pool on the floor.
    const beamMat = (extra) => new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uT: { value: 0 }, uI: { value: 0 }, uC: { value: new THREE.Color() }, uCam: { value: new THREE.Vector3() } },
      vertexShader: `attribute float aAlong; attribute float aRev; varying float vA; varying float vR; varying vec3 vN; varying vec3 vW;
        void main(){ vA = aAlong; vR = aRev; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normal; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uT, uI; uniform vec3 uC, uCam; varying float vA; varying float vR; varying vec3 vN; varying vec3 vW;
        void main(){ float f = abs(dot(normalize(vN), normalize(uCam - vW)));
          float on = smoothstep(vR, vR + 1.0, uT);
          float a = uI * on * pow(f, 1.6) * pow(1.0 - vA, 1.3) * (0.82 + 0.18 * sin(vA * 23.0 - uT * 1.7 + vR * 9.0)) ${extra || ''};
          gl_FragColor = vec4(uC * a, 1.0); }`,
    });
    const buildBeams = (polys, revs) => {
      const pos = [], along = [], rv = [];
      polys.forEach((h, i) => {
        const P = h.map(p => [p[0], p[1] + cy, 0.0]), Q = P.map(p => toFloor(...p));
        for (let k = 0; k < P.length; k++) {
          const k2 = (k + 1) % P.length;
          pos.push(...P[k], ...P[k2], ...Q[k2], ...P[k], ...Q[k2], ...Q[k]); along.push(0, 0, 1, 0, 1, 1);
          for (let j = 0; j < 6; j++) rv.push(revs[i]);
        }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1)); g.setAttribute('aRev', new THREE.Float32BufferAttribute(rv, 1));
      g.computeVertexNormals(); return g;
    };
    // Simplify each star to its 8 tips for the shafts (the cross-section is too thin to read anyway).
    const simp = pd.holes.map(h => (h.length > 8 ? h.filter((_, k) => k % 2 === 0) : h));
    const bMat = beamMat(), beams = new THREE.Mesh(buildBeams(simp, holeRev), bMat); beams.frustumCulled = false; scene.add(beams);
    const sMat = beamMat(), shaft = new THREE.Mesh(buildBeams([[[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]], [-10]), sMat); shaft.frustumCulled = false; scene.add(shaft);

    // --- Lights. The sun only reaches the wood through the holes (it grazes the carved edges).
    const sun = new THREE.PointLight('#ffffff', 0, 0, 0); sun.position.set(SUN.x, SUN.y, SUN.z); scene.add(sun);
    const bounce = new THREE.PointLight('#ff9a48', 0, 0, 2); bounce.position.set(0.6, 0.35, 2.2); scene.add(bounce);
    const key = new THREE.SpotLight('#ffb366', 0, 0, 0.32, 0.9, 0); key.position.set(-4.5 * side, 7.5, 6.5); key.target.position.set(0, PANEL.cy, 0); scene.add(key, key.target);
    scene.add(new THREE.HemisphereLight('#3a2a20', '#000000', 0.25));

    // --- The same shards as s1.
    const shards = makeShards(THREE, rng, pd);
    scene.add(shards.mesh);

    const tmpC = new THREE.Color();
    return {
      scene, camera,
      update(t) {
        applyCam(camera, 6 + t, side);
        uRev.value = t;
        const warm = ease.inOut(range(t, 1.4, 5.0));          // colour temperature of the light
        const built = ease.inOut(range(t, 2.4, 5.0));         // how much of the window is screened
        // Harsh white settles from the s1 white-out, then the light turns amber.
        const harsh = 1 + 0.6 * (1 - ease.out(range(t, 0, 1.4)));
        skyMat.uniforms.uWarm.value = warm; skyMat.uniforms.uI.value = harsh * (1 - 0.15 * warm) * (1 + 0.04 * Math.sin(t * 1.1));
        // Floor: the open window's harsh rectangle fades as the stars take over.
        floorMat.uniforms.uT.value = t;
        floorMat.uniforms.uRect.value = (1 - built) * 0.9 * harsh;
        floorMat.uniforms.uRectC.value.copy(COLD).lerp(HOT, warm).multiplyScalar(1.0);
        floorMat.uniforms.uPool.value = 1.0 + 0.05 * Math.sin(t * 1.3);
        floorMat.uniforms.uPoolC.value.copy(HOT).lerp(AMBER, 0.6).multiplyScalar(1.3);
        floorMat.uniforms.uAmb.value = warm;
        for (const m of [bMat, sMat]) { m.uniforms.uT.value = t; m.uniforms.uCam.value.copy(camera.position); }
        bMat.uniforms.uI.value = 0.05; bMat.uniforms.uC.value.copy(HOT).lerp(AMBER, 0.4);
        sMat.uniforms.uI.value = 0.05 * (1 - built) * harsh; sMat.uniforms.uC.value.copy(COLD).lerp(HOT, warm);
        sun.color.copy(COLD).lerp(tmpC.set('#ffb35a'), warm); sun.intensity = 2.2;
        bounce.intensity = 7 * built; key.intensity = 3.2 * (0.2 + 0.8 * built);
        key.color.copy(COLD).lerp(tmpC.set('#ffb366'), warm);
        const u = shards.material.uniforms;
        u.uL.value.set(-2, 6, 7);
        u.uLc.value.copy(COLD).lerp(tmpC.set('#ffb060'), warm).multiplyScalar(lerp(2.0, 0.9, ease.out(range(t, 0, 2))));
        u.uAmb.value = 0.08; u.uFog.value = 0.06;
        shards.update(6 + t, camera.position);
        const k0 = ease.out(range(t, 0, 1.6));
        return { bloom: { strength: lerp(1.45, 0.6, k0), radius: lerp(0.7, 0.45, k0), threshold: lerp(0.32, 0.8, k0) }, vignette: lerp(0.6, 1.0, k0) };
      },
      overlay(g, t) {
        // Open on the same white s1 ended on.
        const w = 0.88 * (1 - ease.out(range(t, 0, 1.1)));
        const ar = lang === 'ar';
        const x = ar ? 1830 : 90, al = ar ? 'right' : 'left';
        line(g, { text: copy.s2[0], x, y: 470, size: ar ? 64 : 60, align: al, color: '#efe3d3', t, in: 2.3, out: 7.35, dur: 1.2, glow: 16, glowColor: 'rgba(0,0,0,0.7)' });
        line(g, { text: copy.s2[1], x, y: 560, size: ar ? 64 : 60, align: al, color: '#ffcf8a', t, in: 4.2, out: 7.4, dur: 1.3, glow: 26, glowColor: 'rgba(242,163,58,0.35)' });
        if (w > 0.002) { g.save(); g.globalAlpha = w; g.fillStyle = '#eef3f8'; g.fillRect(0, 0, 1920, 1080); g.restore(); }
      },
    };
  },
};
