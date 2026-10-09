# Promo film: team brief

A 48-second cinematic announcement film for **Ahmed Hussein · AI Lessons** (https://ahmed-ai-lessons-website.vercel.app),
a free bilingual (English / Egyptian Arabic) site of short practical AI lessons by an accountant in Riyadh.
Rendered twice: `--lang en` and `--lang ar`. Real 3D (three.js r170) + 2D typography, rendered frame by frame.

## Brand
- Idea: **"AI, softened into light you can work in."** A mashrabiya (carved wooden lattice screen) softens harsh sun into
  patterned, warm light. The site's visual language: warm dark cedar backgrounds (#0d0805 / #16100c), amber light (#f2a33a,
  hot #ffd79a), arches, 8-point star lattice. Three tracks each have their own pattern + colour:
  AI for work = 8-point stars, amber; Finance & CMA = 6-point stars on hex grid, teal (#3fbfb0); Microsoft 365 = diamonds with
  square windows, blue (#6f9cf5). The 4 prompt parts have colours: Role #f2a33a, Task #3fb3a7, Context #e0705f, Format #7fa6ea.
- Fonts (already loaded): display `Messiri` (El Messiri, Latin + Arabic), body `Plex` (IBM Plex Sans Arabic, 400/600), `Mono`.
- Feel: calm, premium, slow confident camera moves, light as the hero. Think Apple product film meets Islamic geometry.
  No cheesy effects, no lens-flare spam, no spinning logos. Restraint. Every shot needs one clear focal point.

## Storyboard (scene file, duration, what happens; all words come from `lib/copy.js`, never hard-code text)
1. `s1-noise.js` 6 s — Darkness full of restless noise: hundreds of small cold-white shards/fragments and thin glitchy lines
   drifting fast in 3D, harsh flickering white light. Words: copy.s1[0] at ~0.8 s, copy.s1[1] at ~3 s. Ends nearly white-out/harsh.
2. `s2-mashrabiya.js` 8 s — The shards slow, turn warm and fly into place, assembling a carved 3D mashrabiya panel (8-point
   star lattice, `panelShape(THREE,'ai',...)` extruded). As it completes, the harsh light behind becomes warm amber and passes
   through the holes: visible light shafts and star-shaped light pools on the floor; slow camera push. Words: copy.s2 lines.
3. `s3-courtyards.js` 10 s — Camera glides through the lattice into a dark courtyard with three tall arches side by side (or
   in sequence), each a glowing window with its own pattern/colour (ai amber, finance teal, m365 blue). Camera tracks past
   each; label each with copy.s3.tracks[i] (name big, count small). Kicker copy.s3.kicker early.
4. `s4-prompt.js` 9 s — The 4-part prompt: four 8-point star gems (Role/Task/Context/Format colours) light up one by one;
   with each, the room's light level rises (25%, 50%, 75%, 100%) and a counter shows it with copy.s4.light. Headline copy.s4.h.
5. `s5-features.js` 8 s — Floating glass UI cards in 3D depth (frosted, warm), slow orbit/parallax, each showing one feature
   from copy.s5.items with a small drawn icon/visual (prompt card with ChatGPT/Claude buttons; audio player with waveform;
   score ring 86/100; "EN · ع" language toggle). Headline copy.s5.h.
6. `s6-endcard.js` 7 s — Resolve: a single arch window with the amber star lattice, Ahmed's portrait
   (`/public/media/portrait-720.webp`, load with ctx.loadTexture) framed in an arch, brand star mark, copy.s6.name + brand,
   tagline, cta, url. Hold the final frame calm for the last ~2 s (it becomes the thumbnail/poster).

## Technical contract (read `film.js`, `lib/*.js`, a placeholder scene)
- Scene module: `export default { id, duration, fadeIn?, fadeOut?, bloom?, async setup(ctx) }`. setup returns
  `{ scene, camera, update(t, k), overlay?(g, t, k) }`. `t` = scene seconds, `k` = t/duration.
  `update` may return `{ bloom: {strength,radius,threshold}, vignette }`. The film handles dips to black (fadeIn/fadeOut,
  default 0.5 s each; set 0 for a hard cut or when you do your own transition).
- **Deterministic**: everything is a pure function of `t`. No Date, no performance.now, no Math.random (use `ctx.rng(seed)` at
  setup time), no physics accumulation across frames. Frames are rendered out of order when checking stills.
- `ctx`: { THREE, renderer, W, H, lang, copy, rng, loadTexture }. Words go on the 2D layer in `overlay(g,...)`, in a fixed
  **1920x1080 design space**. Use `line()` / `scrim()` from `lib/type.js` (Arabic: `g.lang==='ar'` → RTL; never animate
  Arabic per letter). Keep text inside the 16:9 safe area (90 px margins). Text must be readable over the 3D (use scrim or
  placement), at least 34 px for secondary text.
- Performance: frames render on a software GPU. Keep a frame under ~1.5 s at 1920x1080: reasonable poly counts (merge
  geometry, InstancedMesh for many pieces), no shadow maps bigger than 1024, no heavy per-frame geometry rebuilds.
  Fake volumetric light with additive transparent cones/planes and the bloom pass.
- Only edit your own scene files (and new helper files you create named `lib/<scene-id>-*.js`). Do not edit `film.js`,
  `lib/util.js`, `lib/type.js`, `lib/patterns.js`, `lib/copy.js`, `scenes/index.js`; if you need a change there, say so in
  your report. Do not git commit. Do not touch anything outside `video/`.
- Check your work with stills (use your own port so teammates don't clash):
  `cd /home/user/ahmed-ai-lessons-website && node video/render.cjs --lang en --stills 0.5,2,4 --w 960 --h 540 --port 44XX`
  (and `--lang ar`). Look at the PNGs in `video/out/` (Read tool shows images). Iterate until it looks genuinely cinematic.
  Scene times in --stills are **film** seconds: s1 0–6, s2 6–14, s3 14–24, s4 24–33, s5 33–41, s6 41–48.
