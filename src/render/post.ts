import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { Quality } from './quality'

/**
 * Post stack: bloom (tight — neon stays restrained) → anime grade → output.
 * The grade adds a little saturation control, lifts shadows toward blue,
 * a soft vignette and faint chromatic aberration at the edges.
 * No film grain: per-frame noise reads as shimmer (SPEC §2).
 */
const GradeShader = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){
      vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec2 off = d * r2 * 0.012;
      vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c += vec3(0.006, 0.010, 0.032) * (1.0 - smoothstep(0.0, 0.25, l));
      c *= mix(0.7, 1.0, smoothstep(0.85, 0.25, length(d)));
      gl_FragColor = vec4(c, 1.0);
    }`,
}

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, quality: Quality) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2())
  const target = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.HalfFloatType,
    samples: quality === 'high' ? 4 : 0,
  })
  const composer = new EffectComposer(renderer, target)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.32, 0.35, 0.9))
  composer.addPass(new ShaderPass(GradeShader))
  composer.addPass(new OutputPass())
  return {
    composer,
    setSize(w: number, h: number) {
      composer.setPixelRatio(renderer.getPixelRatio())
      composer.setSize(w, h)
    },
    dispose() {
      composer.dispose()
      target.dispose()
    },
  }
}

export type PostStack = ReturnType<typeof createPost>
