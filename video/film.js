// The film: a timeline of scenes, one shared renderer with bloom, grain and vignette,
// and a 2D layer for words. window.film.renderAt(t) draws the exact frame at time t (seconds).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SCENES } from './scenes/index.js';
import { rng, clamp } from './lib/util.js';
import { COPY } from './lib/copy.js';

const q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = +(q.get('h') || 1080), lang = q.get('lang') === 'ar' ? 'ar' : 'en';
const stage = document.getElementById('stage');
stage.style.width = W + 'px'; stage.style.height = H + 'px';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);
const layer = document.createElement('canvas'); layer.width = W; layer.height = H; stage.appendChild(layer);
const g = layer.getContext('2d'); g.lang = lang;

// Post: bloom for the light, then a grade (vignette + fine grain that changes every frame).
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.9, 0.6, 0.72);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 0.9 }, grain: { value: 0.045 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, vig, grain; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time*17.0) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.25, length(d * vec2(1.0, 0.82)));
      c.rgb *= mix(1.0 - vig*0.55, 1.0, v); c.rgb += (h(vUv*vec2(1920.0,1080.0)) - 0.5) * grain; gl_FragColor = c; }`,
});
composer.addPass(renderPass); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.addPass(grade);

const ctx = { THREE, renderer, W, H, lang, copy: COPY[lang], rng, loadTexture: url => new Promise((res, rej) => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, rej)) };

const timeline = []; let start = 0;
async function setup() {
  await document.fonts.load('600 40px Messiri'); await document.fonts.load('400 20px Plex'); await document.fonts.load('600 20px Plex'); await document.fonts.load('500 20px Mono');
  await document.fonts.load('600 40px Messiri', 'عربي'); await document.fonts.load('400 20px Plex', 'عربي'); await document.fonts.load('600 20px Plex', 'عربي');
  for (const S of SCENES) {
    const inst = await S.setup(ctx);
    timeline.push({ S, inst, start, end: start + S.duration });
    start += S.duration;
  }
}

let last = null;
function renderAt(t) {
  t = clamp(t, 0, start - 1e-4);
  const cur = timeline.find(x => t >= x.start && t < x.end) || timeline[timeline.length - 1];
  const lt = t - cur.start, d = cur.S.duration;
  const out = cur.inst.update(lt, lt / d) || {};
  renderPass.scene = cur.inst.scene; renderPass.camera = cur.inst.camera;
  const b = { strength: 0.9, radius: 0.6, threshold: 0.72, ...(cur.S.bloom || {}), ...(out.bloom || {}) };
  bloom.strength = b.strength; bloom.radius = b.radius; bloom.threshold = b.threshold;
  grade.uniforms.time.value = Math.floor(t * 30) / 30; grade.uniforms.vig.value = out.vignette ?? 0.9;
  if (last !== cur.inst) { last = cur.inst; cur.inst.camera.aspect = W / H; cur.inst.camera.updateProjectionMatrix(); }
  composer.render();
  // Words and the dips to black between scenes.
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.filter = 'none'; g.globalAlpha = 1;
  // Scenes always draw words in a 1920x1080 design space, whatever the output size.
  g.setTransform(W / 1920, 0, 0, H / 1080, 0, 0);
  cur.inst.overlay?.(g, lt, lt / d);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const fi = cur.S.fadeIn ?? 0.5, fo = cur.S.fadeOut ?? 0.5;
  const dark = Math.max(fi > 0 ? 1 - clamp(lt / fi) : 0, fo > 0 ? clamp((lt - (d - fo)) / fo) : 0);
  if (dark > 0) { g.globalAlpha = dark; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  return { scene: cur.S.id, local: lt };
}

window.film = { ready: setup().then(() => ({ duration: start, scenes: timeline.map(x => ({ id: x.S.id, start: x.start, end: x.end })) })), renderAt, W, H, lang };
