import * as THREE from 'three'
import { Reflector } from 'three/addons/objects/Reflector.js'
import { fogUniforms } from '@/render/materials'
import { time } from '@/render/time'

/**
 * Canal water. High quality: a planar reflection, sampled with a vertical
 * smear so city lights stretch into streaks like an anime background.
 * Balanced: a cheap shader that fakes the streaks without re-rendering.
 */
export function createCanalWater(opts: { half: number; z0: number; z1: number; y: number }) {
  const len = opts.z0 - opts.z1
  const cz = (opts.z0 + opts.z1) / 2
  const geo = new THREE.PlaneGeometry(opts.half * 2, len)

  const reflector = new Reflector(geo, {
    textureWidth: 512,
    textureHeight: 512,
    color: 0xb4c2ec,
    shader: {
      name: 'CanalShader',
      uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } },
      vertexShader: /* glsl */ `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
        void main(){ vUv = textureMatrix * vec4(position, 1.0); vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `uniform vec3 color; uniform sampler2D tDiffuse; uniform float uTime; varying vec4 vUv; varying vec3 vW;
        void main(){
          vec2 rip = vec2(sin(vW.z * 0.21 + uTime * 1.1) + sin(vW.x * 0.7 - uTime * 0.7), 0.0) * 0.004;
          vec3 acc = vec3(0.0);
          for (int i = -4; i <= 4; i++) { vec4 u = vUv; u.xy += (rip + vec2(0.0, float(i) * 0.007)) * u.w; acc += texture2DProj(tDiffuse, u).rgb; }
          gl_FragColor = vec4(acc / 9.0 * color + vec3(0.012, 0.016, 0.05), 1.0);
        }`,
    },
  })
  // uTime is added after construction: Reflector clones its shader uniforms, which would
  // otherwise detach this one from the shared clock.
  ;(reflector.material as THREE.ShaderMaterial).uniforms.uTime = time
  reflector.rotation.x = -Math.PI / 2
  reflector.position.set(0, opts.y, cz)

  const fake = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      fog: true,
      uniforms: { ...fogUniforms(), uTime: time },
      vertexShader: /* glsl */ `#include <fog_pars_vertex>
        varying vec3 vW;
        void main(){ vW = (modelMatrix * vec4(position, 1.0)).xyz; vec4 mvPosition = viewMatrix * vec4(vW, 1.0); gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `#include <fog_pars_fragment>
        uniform float uTime; varying vec3 vW;
        float hash(float x){ x = fract(x * 0.1031); x *= x + 33.33; x *= x + x; return fract(x); }
        void main(){
          float lane = floor(vW.x / 3.0);
          float streak = step(0.72, hash(lane)) * (0.5 + 0.5 * sin(vW.z * 0.08 + hash(lane) * 20.0 + uTime * 0.6));
          vec3 c = mix(vec3(1.0, 0.7, 0.35), vec3(0.3, 0.8, 1.0), step(0.5, hash(lane + 7.0)));
          float edge = fract(vW.x / 3.0);
          vec3 col = vec3(0.02, 0.025, 0.07) + c * streak * 0.12 * smoothstep(0.0, 1.0, edge * (1.0 - edge) * 4.0);
          gl_FragColor = vec4(col, 1.0);
          #include <fog_fragment>
        }`,
    }),
  )
  fake.rotation.x = -Math.PI / 2
  fake.position.set(0, opts.y, cz)

  const group = new THREE.Group()
  group.add(reflector, fake)
  return {
    group,
    setQuality(high: boolean) {
      reflector.visible = high
      fake.visible = !high
    },
    /** Reflection renders at half the drawing-buffer resolution. */
    setSize(w: number, h: number, dpr: number) {
      reflector.getRenderTarget().setSize(Math.max(1, Math.floor(w * dpr * 0.5)), Math.max(1, Math.floor(h * dpr * 0.5)))
    },
    dispose() {
      reflector.dispose()
      fake.material.dispose()
      geo.dispose()
    },
  }
}
