import * as THREE from 'three'
import { hdr } from './palette'

/**
 * Rim-light colour shared by every rim-enabled material and the traveler.
 * The active zone lerps it toward the colour of the area you're standing in.
 */
export const RIM = { value: new THREE.Color('#3ff2ff') }

/** Hard two-tone ramp: anime cel shading. Shadows pick up the blue hemi light. */
const CEL_RAMP = (() => {
  const t = new THREE.DataTexture(new Uint8Array([105, 255]), 2, 1, THREE.RedFormat)
  t.minFilter = THREE.NearestFilter
  t.magFilter = THREE.NearestFilter
  t.needsUpdate = true
  return t
})()

export interface CelOptions {
  /** Strength of the coloured fresnel rim (0 = none). */
  rim?: number
  map?: THREE.Texture | null
  side?: THREE.Side
}

export function cel(color: THREE.ColorRepresentation, { rim = 0, map = null, side = THREE.FrontSide }: CelOptions = {}) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: CEL_RAMP, map, side })
  if (rim > 0) {
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uRimCol = RIM
      shader.uniforms.uRimAmt = { value: rim }
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uRimCol; uniform float uRimAmt;')
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          { float fr = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
            totalEmissiveRadiance += uRimCol * smoothstep(0.55, 0.75, fr) * uRimAmt; }`,
        )
    }
    m.customProgramCacheKey = () => `cel-rim-${rim}`
  }
  return m
}

/** Unlit light source. k scales intensity; above ~1 it reaches the bloom threshold. */
export function glow(hex: string, k = 1.2, extra: THREE.MeshBasicMaterialParameters = {}) {
  return new THREE.MeshBasicMaterial({ color: hdr(hex, k), ...extra })
}

/** Fog uniforms for custom ShaderMaterials that include the fog chunks. */
export function fogUniforms() {
  return THREE.UniformsUtils.clone(THREE.UniformsLib.fog)
}
