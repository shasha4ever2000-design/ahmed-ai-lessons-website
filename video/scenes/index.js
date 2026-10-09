// The running order. Each scene file exports default { id, duration, fadeIn?, fadeOut?, bloom?, setup(ctx) }.
// setup returns { scene, camera, update(t, k) -> {bloom?, vignette?}, overlay?(g, t, k) } where t is the
// scene's own time in seconds and k = t / duration.
import s1 from './s1-noise.js';
import s2 from './s2-mashrabiya.js';
import s3 from './s3-courtyards.js';
import s4 from './s4-prompt.js';
import s5 from './s5-features.js';
import s6 from './s6-endcard.js';
export const SCENES = [s1, s2, s3, s4, s5, s6];
