/**
 * GLSL shared by the procedural shaders.
 *
 * Stability rules (SPEC §2): hashes are sine-free so they stay identical for
 * large inputs on every GPU, and periodic patterns are box-filtered over the
 * pixel footprint so they never crawl or flicker when the camera moves.
 */

/** Dave Hoskins' sine-free hashes. */
export const HASH_GLSL = /* glsl */ `
float h11(float x){ x = fract(x * 0.1031); x *= x + 33.33; x *= x + x; return fract(x); }
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
`

/**
 * fpulse(x, lo, hi, w): the exact average of a period-1 pulse (1 inside
 * [lo, hi], 0 outside) over a window of width w centred on x. Pass
 * w = fwidth(x) to get an anti-aliased pattern.
 */
export const FILTER_GLSL = /* glsl */ `
float pint(float x, float lo, float hi){ return floor(x) * (hi - lo) + clamp(fract(x), lo, hi) - lo; }
float fpulse(float x, float lo, float hi, float w){ return (pint(x + 0.5 * w, lo, hi) - pint(x - 0.5 * w, lo, hi)) / w; }
`

/** Value noise + fbm on top of h21. */
export const NOISE_GLSL = /* glsl */ `
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = p * 2.07 + 5.3; a *= 0.5; } return v; }
`
