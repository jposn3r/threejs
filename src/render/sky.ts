import * as THREE from 'three'
import { HASH_GLSL, NOISE_GLSL } from './glsl'
import { PAL } from './palette'
import { time } from './time'

/**
 * Night sky dome: blue gradient, city glow on the horizon, a moon with a
 * soft halo, clouds lit blue from below, sparse stars. Follow the camera
 * with `sky.position.copy(camera.position)` each frame.
 */
export function createSky(moonDir: THREE.Vector3) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(3000, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uMoon: { value: moonDir },
        uTime: time,
        c0: { value: new THREE.Color(PAL.sky0) },
        c1: { value: new THREE.Color(PAL.sky1) },
        c2: { value: new THREE.Color(PAL.sky2) },
      },
      vertexShader: /* glsl */ `varying vec3 vDir;
        void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `varying vec3 vDir; uniform vec3 uMoon, c0, c1, c2; uniform float uTime;
        ${HASH_GLSL}
        ${NOISE_GLSL}
        void main(){
          vec3 d = normalize(vDir); float h = d.y;
          vec3 col = mix(c1, c0, smoothstep(0.05, 0.75, h));
          col = mix(c2, col, smoothstep(-0.02, 0.28, h));
          col += vec3(0.30, 0.10, 0.45) * (1.0 - smoothstep(-0.05, 0.12, h)) * 0.6;
          float s = dot(d, normalize(uMoon));
          float disk = smoothstep(0.99905, 0.99925, s);
          col += vec3(0.95, 0.97, 1.0) * disk * 2.6 * (0.85 + 0.15 * vnoise(d.xy * 900.0));
          col += vec3(0.55, 0.65, 1.0) * (pow(max(s, 0.0), 300.0) * 0.9 + pow(max(s, 0.0), 18.0) * 0.22);
          if (h > 0.0) {
            vec2 p = d.xz / (h + 0.18) * 1.4 + vec2(uTime * 0.004, 0.0);
            float cl = smoothstep(0.48, 0.72, fbm(p)) * smoothstep(0.02, 0.3, h) * (1.0 - disk);
            vec3 cc = mix(vec3(0.07, 0.10, 0.32), vec3(0.42, 0.52, 1.0), smoothstep(0.5, 0.85, fbm(p * 1.6 + 2.0)));
            cc += vec3(0.6, 0.7, 1.0) * pow(max(s, 0.0), 12.0) * 0.8;
            col = mix(col, cc, cl * 0.9);
            col += vec3(0.8, 0.85, 1.0) * step(0.9965, h21(floor(d.xz / (h + 0.3) * 300.0))) * (1.0 - cl) * smoothstep(0.15, 0.5, h) * 0.7;
          }
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  )
}
