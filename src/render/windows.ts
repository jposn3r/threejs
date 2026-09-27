import * as THREE from 'three'
import { cel } from './materials'
import { FILTER_GLSL, HASH_GLSL } from './glsl'
import { PAL } from './palette'

/**
 * Procedural window shaders, injected into the cel material.
 *
 * Windows are painted from world position, so geometry stays plain boxes.
 * Anti-aliased with fpulse + fwidth; windows smaller than ~5 px fade into the
 * facade's average glow. Per-building seeds arrive as flat varyings.
 */

/** Detailed, merged city buildings. Needs a per-vertex `aSeed` attribute. */
export function facadeMaterial(winGain = 1.0) {
  const m = cel(PAL.facade)
  const uWin = { value: winGain }
  m.onBeforeCompile = (s) => {
    s.uniforms.uWin = uWin
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float aSeed; flat varying float vSeed; varying vec3 vWP; varying vec3 vWN;`)
      .replace('#include <project_vertex>', `#include <project_vertex>
        vSeed = aSeed;
        vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vWN = normalize(mat3(modelMatrix) * objectNormal);`)
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
        flat varying float vSeed; varying vec3 vWP; varying vec3 vWN; uniform float uWin;
        ${HASH_GLSL}
        ${FILTER_GLSL}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          vec3 n = normalize(vWN);
          float side = 1.0 - step(0.6, abs(n.y));
          vec2 uvw = abs(n.x) > abs(n.z) ? vWP.zy : vWP.xy;
          float sd = vSeed;
          float style = floor(h11(sd * 1.3) * 3.0);
          vec2 cs = style < 0.5 ? vec2(2.4, 3.4) : (style < 1.5 ? vec2(4.8, 3.4) : vec2(1.9, 3.4));
          vec2 mg = style < 0.5 ? vec2(0.16, 0.3) : (style < 1.5 ? vec2(0.05, 0.34) : vec2(0.12, 0.36));
          vec2 q = uvw / cs;
          vec2 fw = max(fwidth(q), vec2(1e-4));
          vec2 cell = floor(q);
          float win = fpulse(q.x, mg.x, 1.0 - mg.x, fw.x) * fpulse(q.y, mg.y, 1.0 - mg.y, fw.y);
          float floorOn = step(0.5 - 0.25 * h11(sd * 5.1), h21(vec2(cell.y, sd)));
          float runLen = 3.0 + floor(h11(sd * 7.1) * 7.0);
          float runOn = step(0.4, h21(vec2(floor(cell.x / runLen), cell.y + sd * 13.0)));
          float lit = floorOn * runOn * step(0.15, h21(cell + sd));
          float hue = h11(sd * 3.7);
          vec3 wc = hue < 0.55 ? vec3(1.0, 0.7, 0.3) : (hue < 0.85 ? vec3(0.28, 0.8, 1.0) : vec3(0.86, 0.9, 1.0));
          vec3 wcAvg = wc * 0.95;
          wc *= 0.7 + 0.5 * h21(cell * 0.37 + sd);
          float detail = 1.0 - smoothstep(0.05, 0.18, max(fw.x, fw.y));
          float duty = (1.0 - 2.0 * mg.x) * (1.0 - 2.0 * mg.y);
          diffuseColor.rgb *= 1.0 - 0.45 * mix(duty, win, detail) * side;
          diffuseColor.rgb *= 1.0 - 0.3 * fpulse(q.y, 0.0, 0.06, fw.y) * side * detail;
          totalEmissiveRadiance += mix(wcAvg * 0.3 * duty, wc * win * lit, detail) * side * uWin;
        }`)
  }
  m.customProgramCacheKey = () => 'mk-facade'
  return m
}

/** Far skyline towers drawn as one InstancedMesh; the seed is the instance origin. */
export function towerMaterial(winGain = 0.75) {
  const m = cel(PAL.facade)
  const uWin = { value: winGain }
  m.onBeforeCompile = (s) => {
    s.uniforms.uWin = uWin
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
        varying vec3 vWP; varying vec3 vWN; flat varying vec3 vOrigin;`)
      .replace('#include <project_vertex>', `#include <project_vertex>
        mat4 mm = modelMatrix;
        #ifdef USE_INSTANCING
          mm = modelMatrix * instanceMatrix;
        #endif
        vWP = (mm * vec4(transformed, 1.0)).xyz;
        vWN = normalize(mat3(mm) * objectNormal);
        vOrigin = (mm * vec4(0.0, 0.0, 0.0, 1.0)).xyz;`)
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vWP; varying vec3 vWN; flat varying vec3 vOrigin; uniform float uWin;
        ${HASH_GLSL}
        ${FILTER_GLSL}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          vec3 n = normalize(vWN);
          float side = 1.0 - step(0.5, abs(n.y));
          vec2 uvw = abs(n.x) > 0.5 ? vWP.zy : vWP.xy;
          float bid = h21(floor(vOrigin.xz * 0.37));
          vec2 q = uvw / vec2(2.6, 3.4);
          vec2 fw = max(fwidth(q), vec2(1e-4));
          vec2 cell = floor(q);
          float win = fpulse(q.x, 0.15, 0.85, fw.x) * fpulse(q.y, 0.3, 0.7, fw.y);
          float lit = step(0.5, h21(vec2(cell.y, bid))) * step(0.35, h21(cell + bid));
          vec3 wc = bid < 0.55 ? vec3(1.0, 0.7, 0.3) : vec3(0.3, 0.8, 1.0);
          float detail = 1.0 - smoothstep(0.05, 0.18, max(fw.x, fw.y));
          totalEmissiveRadiance += wc * mix(0.28 * 0.33, win * lit, detail) * side * uWin;
        }`)
  }
  m.customProgramCacheKey = () => 'mk-tower'
  return m
}

export type WindowMaterial = THREE.MeshToonMaterial
