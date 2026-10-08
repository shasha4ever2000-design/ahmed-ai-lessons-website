// The homepage room: sunlight through a carved mashrabiya lattice.
// Loaded only on the homepage, only when the room is on screen, only with WebGL and motion allowed.
import * as THREE from 'three';

export type Room = { setTime(i: number): void; setLight(f: number): void };

// three.js r155+ uses physical light units; this scale matches the look of the concept.
const SUN = 60;
const TIMES = [
  { c: 0xff9f5a, sky: 0xffb27a, p: [-6, 4, -9], i: 2.6 },   // dawn
  { c: 0xffdca0, sky: 0xfff1d6, p: [-1, 10, -8], i: 3.4 },  // noon
  { c: 0xff7a6a, sky: 0xe58a6e, p: [6, 3.5, -9], i: 2.4 },  // dusk
];

// Quality tier from what the device tells us. Small or modest devices get fewer pixels and softer shadows.
function tier() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const small = Math.min(innerWidth, innerHeight) < 600;
  const modest = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4;
  return small || modest ? { dpr: 1.25, shadow: 1024, aa: false } : { dpr: 1.75, shadow: 1536, aa: true };
}

export function createRoom(host: HTMLElement): Room {
  const q = tier();
  const renderer = new THREE.WebGLRenderer({ antialias: q.aa, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, q.dpr));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x16100c);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x16100c, 0.035);
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  cam.position.set(3.2, 2.6, 12.5);
  cam.lookAt(0, 0.9, 0);

  // Lattice: one plate with eight-point stars cut out, small diamonds where four cells meet.
  const COLS = 6, ROWS = 8, C = 1, W = COLS * C, H = ROWS * C;
  const plate = new THREE.Shape();
  plate.moveTo(-W / 2, 0); plate.lineTo(W / 2, 0); plate.lineTo(W / 2, H); plate.lineTo(-W / 2, H); plate.lineTo(-W / 2, 0);
  const star = (cx: number, cy: number, R: number) => {
    const p = new THREE.Path(), r = R * 0.765;
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI) / 8 + Math.PI / 16, rad = k % 2 ? r : R;
      const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      k ? p.lineTo(x, y) : p.moveTo(x, y);
    }
    p.closePath();
    return p;
  };
  const diamond = (cx: number, cy: number, R: number) => {
    const p = new THREE.Path();
    p.moveTo(cx + R, cy); p.lineTo(cx, cy + R); p.lineTo(cx - R, cy); p.lineTo(cx, cy - R); p.closePath();
    return p;
  };
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) plate.holes.push(star(-W / 2 + C / 2 + i * C, C / 2 + j * C, 0.41));
  for (let i = 1; i < COLS; i++) for (let j = 1; j < ROWS; j++) plate.holes.push(diamond(-W / 2 + i * C, j * C, 0.12));
  const wood = new THREE.MeshStandardMaterial({ color: 0x6e4a2c, roughness: 0.75, metalness: 0.05 });
  const lattice = new THREE.Mesh(new THREE.ExtrudeGeometry(plate, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1, curveSegments: 2 }), wood);
  lattice.position.set(0, -1.2, -0.08);
  lattice.castShadow = true;
  scene.add(lattice);

  // Frame, wall with the window opening, floor
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2718, roughness: 0.8 });
  for (const y of [-1.35, H - 1.05]) { const m = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.3, 0.4), frameMat); m.position.set(0, y, 0); m.castShadow = true; scene.add(m); }
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, H + 0.3, 0.4), frameMat); m.position.set(s * (W / 2 + 0.15), H / 2 - 1.2, 0); m.castShadow = true; scene.add(m); }
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-14, -2); wallShape.lineTo(14, -2); wallShape.lineTo(14, 12); wallShape.lineTo(-14, 12); wallShape.lineTo(-14, -2);
  const hole = new THREE.Path();
  hole.moveTo(-W / 2 - 0.3, -1.5); hole.lineTo(W / 2 + 0.3, -1.5); hole.lineTo(W / 2 + 0.3, H - 0.9); hole.lineTo(-W / 2 - 0.3, H - 0.9); hole.closePath();
  wallShape.holes.push(hole);
  const wall = new THREE.Mesh(new THREE.ShapeGeometry(wallShape), new THREE.MeshStandardMaterial({ color: 0x8b7a68, roughness: 0.95 }));
  wall.position.z = -0.1; wall.castShadow = true; wall.receiveShadow = true; scene.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0xf3dcb4, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; floor.receiveShadow = true; scene.add(floor);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshBasicMaterial({ color: 0xfff4dc }));
  sky.position.set(0, 4, -6); scene.add(sky);
  scene.add(new THREE.AmbientLight(0x6a4a33, 1.3));
  const sun = new THREE.SpotLight(0xfff0d0, SUN * 3.4, 40, 0.55, 0.35, 1.2);
  sun.castShadow = true; sun.shadow.mapSize.set(q.shadow, q.shadow); sun.shadow.bias = -0.0006; sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
  sun.position.set(-1, 10, -8); sun.target.position.set(0.6, -1.6, 5); scene.add(sun, sun.target);

  // Dust in the beam
  const N = 420, dg = new THREE.BufferGeometry(), dp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { dp[i * 3] = (Math.random() - 0.5) * 6; dp[i * 3 + 1] = Math.random() * 6 - 1.4; dp[i * 3 + 2] = Math.random() * 6; }
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.035, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  let want = TIMES[1], sx = 0, sy = 0, light = 1, running = false, last = performance.now(), drawn = 0;
  // Frame pacing: about 30 frames a second is plenty for drifting dust and a moving sun,
  // and it halves the work. If the device still can't keep up, stop and keep the still frame.
  const FRAME = 1000 / 30;
  let slow = 0, frames = 0, gaveUp = false, lastInput = performance.now(), prevTick = 0;
  const tc = new THREE.Color();
  const skyBase = new THREE.Color();
  host.addEventListener('pointermove', e => { lastInput = performance.now(); const b = host.getBoundingClientRect(); sx = ((e.clientX - b.left) / b.width - 0.5) * 4; sy = ((e.clientY - b.top) / b.height - 0.5) * -2; });

  function size() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  size();
  new ResizeObserver(size).observe(host);

  function step(k: number) {
    sun.position.x += (want.p[0] + sx - sun.position.x) * k;
    sun.position.y += (want.p[1] + sy - sun.position.y) * k;
    sun.position.z = want.p[2];
    tc.setHex(want.c); sun.color.lerp(tc, k);
    skyBase.setHex(want.sky).multiplyScalar(0.2 + 0.8 * light); sky.material.color.lerp(skyBase, k);
    tc.setHex(want.sky); dust.material.color.lerp(tc, k);
    // A complete prompt lets the full sun in; each missing part dims the room.
    const target = SUN * want.i * (0.04 + 0.96 * light * light);
    sun.intensity += (target - sun.intensity) * k;
    dust.material.opacity = 0.08 + 0.55 * light;
  }
  function frame(now: number) {
    if (!running || gaveUp) return;
    // Watch the first dozen frames: if the browser can't even call us 15 times a second
    // (the GPU work lands between calls), this device keeps the last frame as a still picture.
    if (frames < 12) {
      if (prevTick && frames++ && now - prevTick > 66) slow++;
      prevTick = now;
      if (frames === 12 && slow >= 5) { gaveUp = true; running = false; host.dataset.still = "slow"; return; }
    }
    requestAnimationFrame(frame);
    // After a quiet spell with nothing to move toward, slow down to save battery.
    const idle = now - lastInput > 12000;
    if (now - drawn < (idle ? FRAME * 2 : FRAME) - 2) return;
    const dt = Math.min((now - last) / 1000, 0.07); last = now; drawn = now;
    step(Math.min(1, dt * 2.2));
    const a = dg.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) { a[i * 3 + 1] += dt * 0.05 * Math.sin(now / 1700 + i); a[i * 3] += dt * 0.03 * Math.cos(now / 2300 + i * 1.3); if (a[i * 3 + 1] > 4.6) a[i * 3 + 1] = -1.4; }
    dg.attributes.position.needsUpdate = true;
    cam.position.x += (3.2 + sx * 0.25 - cam.position.x) * 0.03; cam.lookAt(0, 0.9, 0);
    renderer.render(scene, cam);
  }
  // Only animate while the room is on screen.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running && !gaveUp) { running = true; last = performance.now(); prevTick = 0; requestAnimationFrame(frame); }
    else if (!e.isIntersecting) running = false;
  }).observe(host);
  step(1); renderer.render(scene, cam);

  return {
    setTime(i) { lastInput = performance.now(); want = TIMES[i] || TIMES[1]; if (!running) { step(1); renderer.render(scene, cam); } },
    setLight(f) { lastInput = performance.now(); light = Math.max(0, Math.min(1, f)); if (!running) { step(1); renderer.render(scene, cam); } },
  };
}
