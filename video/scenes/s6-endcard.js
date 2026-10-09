// Scene 6 — The resolve. One arch window: the amber 8-point star lattice glows behind Ahmed, who
// stands framed in the arch. Beside him, the lock-up: star mark + brand, name, tagline, call to
// action and address. The camera settles by t = 5 and the last two seconds hold still (poster frame).
import { line } from '../lib/type.js';
import { starPts } from '../lib/patterns.js';
import { range, ease, C } from '../lib/util.js';
import { archOutline, archLattice, latticeMask, backplate, motes, fitSize, softScrim } from '../lib/s3-light.js';

const AW = 2.7, AH = 4.35, SILL = 0.3;   // arch opening
const HOLD = 5.0;                        // everything is still from here on

export default {
  id: 's6-endcard', duration: 7, fadeIn: 0.6, fadeOut: 0.9,
  bloom: { strength: 0.75, radius: 0.6, threshold: 0.92 },
  async setup({ THREE, lang, rng, copy, loadTexture }) {
    const m = lang === 'ar' ? -1 : 1;
    const rand = rng(606);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d0805');
    const camera = new THREE.PerspectiveCamera(28, 16 / 9, 0.1, 60);
    const V2 = ([x, y]) => new THREE.Vector2(x, y);
    const AX = 2.05 * m, CY = SILL + AH / 2;

    // ---- Wall with one arch opening, a gilded moulding and a stone sill.
    const wallMat = new THREE.MeshStandardMaterial({ color: '#3a281c', roughness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#c98d3e', roughness: 0.32, metalness: 0.75 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#2b1a10', roughness: 0.65 });
    const ws = new THREE.Shape([[-14, -4], [14, -4], [14, 10], [-14, 10]].map(V2));
    ws.holes.push(new THREE.Path(archOutline(AW, AH).map(([x, y]) => V2([x + AX, y + SILL]))));
    const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(ws, { depth: 0.45, bevelEnabled: false, curveSegments: 4 }), wallMat);
    wall.position.z = -0.45; scene.add(wall);
    const ring = (grow, depth, mat, z) => {
      const s = new THREE.Shape(archOutline(AW + grow * 2, AH + grow).map(([x, y]) => V2([x, y - grow])));
      s.holes.push(new THREE.Path(archOutline(AW, AH).map(V2)));
      const r = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 4 }), mat);
      r.position.set(AX, SILL, z); scene.add(r); return r;
    };
    ring(0.07, 0.05, goldMat, 0);
    ring(0.32, 0.03, new THREE.MeshStandardMaterial({ color: '#2e1f15', roughness: 0.85 }), 0);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(AW + 1.0, 0.16, 0.5), new THREE.MeshStandardMaterial({ color: '#3d2a1d', roughness: 0.7 }));
    sill.position.set(AX, SILL - 0.08, 0.1); scene.add(sill);

    // ---- The amber star lattice and the warm light behind it.
    const lat = archLattice(THREE, 'ai', AW, AH, 0.3, { inset: 0.05, grow: 0.1 });
    const lm = new THREE.Mesh(new THREE.ExtrudeGeometry(lat.shape, { depth: 0.06, bevelEnabled: false, curveSegments: 3 }), woodMat);
    lm.position.set(AX, SILL, -0.36); scene.add(lm);
    const bp = backplate(THREE, { color: C.amber, w: AW + 1, h: AH + 1, top: 4.2, bottom: 0.9 });
    bp.mesh.position.set(AX, CY, -0.75); scene.add(bp.mesh);
    const soft = latticeMask(THREE, lat, AW, AH, { px: 256, blur: 4 });

    // ---- Portrait: the cut-out stands in front of the lattice, cropped by the arch reveal.
    const tex = await loadTexture('/public/media/portrait-720.webp');
    tex.anisotropy = 8;
    const PW = 2.95, PH = PW * (703 / 720);
    // A soft warm shadow behind the figure keeps the face clear of the brightest lattice.
    const shadowMat = new THREE.ShaderMaterial({
      uniforms: { a: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float a; varying vec2 vUv; void main(){ vec2 d = (vUv - vec2(0.5, 0.42)) * vec2(1.25, 1.0);
        float k = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(0.03, 0.018, 0.01, k * a); }`,
      transparent: true, depthWrite: false,
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(PW * 1.2, PH * 1.3), shadowMat);
    shadow.position.set(AX, SILL + PH * 0.55, -0.3); scene.add(shadow);
    const pMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color(0.86, 0.8, 0.74), opacity: 0 });
    const portrait = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), pMat);
    portrait.position.set(AX, SILL + PH / 2 - 0.02, -0.16); portrait.renderOrder = 3; scene.add(portrait);

    const mo = motes(THREE, { rand, n: 70, mask: soft, color: C.amberHot, size: 0.03, cx: AX, y0: SILL, w: AW, H: AH, zw: -0.3, dx: 0.12 * m, dz: 0.7 });
    scene.add(mo.points);

    // ---- Light
    scene.add(new THREE.HemisphereLight('#4d3626', '#0a0604', 0.5));
    const key = new THREE.PointLight('#ffc27a', 0, 14, 2); key.position.set(AX - 2.2 * m, 3.8, 3.2); scene.add(key);
    const back = new THREE.PointLight(C.amber, 0, 2.6, 2); back.position.set(AX, CY + 0.6, -0.6); scene.add(back);
    const spill = new THREE.PointLight(C.amber, 0, 9, 2); spill.position.set(AX, 1.4, 1.6); scene.add(spill);

    // ---- Camera: a slow push that settles at HOLD.
    const look = new THREE.Vector3();

    return {
      scene, camera,
      update(t) {
        const tt = Math.min(t, HOLD), k = ease.inOut(tt / HOLD);
        camera.position.set(0.55 * m * (1 - k), 2.3 + 0.2 * k, 11.6 - 1.2 * k);
        look.set(0.12 * m * (1 - k), 2.5, 0); camera.lookAt(look);
        const on = ease.inOut(range(t, 0.0, 2.4));
        bp.mat.uniforms.amp.value = 0.25 + 0.75 * on;
        back.intensity = 6 * on; spill.intensity = 10 * on; key.intensity = 18 * (0.4 + 0.6 * on);
        const pr = ease.out(range(t, 0.5, 2.0));
        pMat.opacity = pr; shadowMat.uniforms.a.value = 0.75 * pr;
        portrait.position.y = SILL + PH / 2 - 0.02 - 0.06 * (1 - pr);
        mo.mat.uniforms.time.value = Math.min(t, HOLD) + Math.max(0, t - HOLD) * 0.25;
        mo.mat.uniforms.amp.value = 1.2 * on;
        return { vignette: 0.9 };
      },
      overlay(g, t) {
        const c = copy.s6, rtl = m < 0, x = rtl ? 1760 : 160, align = rtl ? 'right' : 'left';
        const maxW = 860;
        softScrim(g, { x: rtl ? 1420 : 500, y: 560, rx: 640, ry: 330, alpha: 0.35 * range(t, 0.6, 1.6) });
        // Star mark + brand.
        const a1 = ease.out(range(t, 1.0, 1.9));
        if (a1 > 0) {
          const R = 24, sx = rtl ? x - R : x + R, sy = 352;
          g.save(); g.globalAlpha = a1;
          g.translate(sx, sy); g.rotate((1 - a1) * -0.6); g.scale(0.7 + 0.3 * a1, 0.7 + 0.3 * a1);
          const pts = starPts(0, 0, 8, R, R * 0.62, -90 + 22.5);
          const grd = g.createLinearGradient(0, -R, 0, R); grd.addColorStop(0, C.amberHot); grd.addColorStop(1, C.amber);
          g.shadowColor = 'rgba(242,163,58,0.7)'; g.shadowBlur = 18;
          g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fillStyle = grd; g.fill();
          g.shadowBlur = 0; g.beginPath(); g.arc(0, 0, R * 0.26, 0, Math.PI * 2); g.fillStyle = '#2a1a10'; g.fill();
          g.restore();
        }
        const bx = rtl ? x - 66 : x + 66;
        line(g, { text: c.brand, x: bx, y: 365, size: fitSize(g, c.brand, { size: 38, maxW: maxW - 66, font: 'body' }), font: 'body', weight: 600, t, in: 1.15, dur: 0.9, align, color: C.amber, letter: 2 });
        const ns = fitSize(g, c.name, { size: 116, maxW });
        line(g, { text: c.name, x, y: 488, size: ns, t, in: 1.35, dur: 1.1, align, color: C.cream });
        const ts = fitSize(g, c.tag, { size: 46, maxW, min: 34 });
        line(g, { text: c.tag, x, y: 566, size: ts, t, in: 1.9, dur: 1.1, align, color: C.text2, weight: 500 });
        const kr = ease.out(range(t, 2.5, 3.4));
        if (kr > 0) { g.save(); g.globalAlpha = kr; g.fillStyle = C.amber; const len = 84 * kr; g.fillRect(rtl ? x - len : x, 624, len, 3); g.restore(); }
        const cs = fitSize(g, c.cta, { size: 42, maxW, font: 'body', min: 34 });
        line(g, { text: c.cta, x, y: 700, size: cs, font: 'body', weight: 600, t, in: 2.7, dur: 1.0, align, color: C.cream });
        line(g, { text: c.url, x, y: 762, size: 36, font: 'mono', weight: 500, t, in: 3.1, dur: 1.0, align, color: C.amberHot, rtl: false });
      },
    };
  },
};
