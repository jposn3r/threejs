import * as THREE from 'three'
import type { Rng } from '@/lib/rng'
import { canvasTexture, radialTexture } from '@/render/canvas'
import { HASH_GLSL } from '@/render/glsl'
import { glow } from '@/render/materials'
import { PAL, hdr } from '@/render/palette'

/** Everything that makes the city feel alive and deep. Each piece returns its own update. */

export interface Animated {
  object: THREE.Object3D
  update?: (t: number, dt: number, focus: THREE.Vector3) => void
}

/** Street level far below: small, sparse lamps that fade to an even glow when tiny. */
export function createStreet(groundY: number): Animated {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.ShaderMaterial({
      fog: false,
      vertexShader: /* glsl */ `varying vec3 vP; void main(){ vP = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.0); }`,
      fragmentShader: /* glsl */ `varying vec3 vP;
        ${HASH_GLSL}
        void main(){
          vec2 g = vP.xz / 6.0; vec2 i = floor(g), f = fract(g);
          float px = fwidth(g.x);
          float lamp = step(0.94, h21(i)) * (1.0 - smoothstep(0.02, 0.12 + px, length(f - 0.5)));
          lamp = mix(lamp, 0.004, smoothstep(0.05, 0.2, px));
          vec3 lc = mix(vec3(1.0, 0.7, 0.35), vec3(0.4, 0.8, 1.0), step(0.6, h21(i + 3.1)));
          vec3 base = vec3(0.03, 0.035, 0.1) + lc * lamp * 0.22;
          float r = length(vP.xz - vec2(0.0, -300.0)) / 1600.0;
          gl_FragColor = vec4(mix(base, vec3(0.07, 0.09, 0.26), smoothstep(0.05, 0.7, r)), 1.0);
        }`,
    }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = groundY - 0.6
  return { object: mesh }
}

/** Blinking red aviation lights, split into two alternating groups. */
export function createBeacons(beacons: [number, number, number][]): Animated {
  const group = new THREE.Group()
  const geo = new THREE.SphereGeometry(0.9, 8, 6)
  const mat = glow(PAL.red, 1.8)
  const halves = [0, 1].map(() => new THREE.InstancedMesh(geo, mat, Math.ceil(beacons.length / 2)))
  const counts = [0, 0]
  const m4 = new THREE.Matrix4()
  beacons.forEach(([x, y, z], i) => halves[i % 2].setMatrixAt(counts[i % 2]++, m4.makeTranslation(x, y, z)))
  halves.forEach((h, i) => {
    h.count = counts[i]
    group.add(h)
  })
  return {
    object: group,
    update: (t) => {
      const on = t % 2.4 < 1.2
      halves[0].visible = on
      halves[1].visible = !on
    },
  }
}

/** Soft haze sheets down the canal: atmospheric depth like a painted background. */
export function createHaze(groundY: number, zs = [-150, -320, -520, -760, -1000]): Animated {
  const alpha = canvasTexture(4, 256, (g) => {
    const gr = g.createLinearGradient(0, 256, 0, 0)
    gr.addColorStop(0, 'rgba(255,255,255,0.9)')
    gr.addColorStop(0.35, 'rgba(255,255,255,0.35)')
    gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, 4, 256)
  })
  alpha.colorSpace = THREE.NoColorSpace
  const mat = new THREE.MeshBasicMaterial({ color: hdr('#2a3a8c', 0.9), alphaMap: alpha, transparent: true, opacity: 0.22, depthWrite: false, fog: false, side: THREE.DoubleSide })
  const group = new THREE.Group()
  for (const z of zs) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1600, 240), mat)
    m.position.set(0, groundY + 95, z)
    group.add(m)
  }
  return { object: group }
}

/** Flying traffic between the towers. */
export function createTraffic(rng: Rng, n = 60): Animated {
  const geo = new THREE.CapsuleGeometry(0.6, 2.8, 4, 8).rotateX(Math.PI / 2)
  const mesh = new THREE.InstancedMesh(geo, glow('#ffffff', 0.9), n)
  const palette = [PAL.white, PAL.red, PAL.white, PAL.warm, PAL.red]
  const cars = Array.from({ length: n }, (_, i) => {
    mesh.setColorAt(i, new THREE.Color(palette[i % palette.length]))
    return {
      alongZ: rng() < 0.5,
      lane: (rng() < 0.5 ? -1 : 1) * (60 + rng() * 260),
      y: 15 + rng() * 140,
      t: -500 + rng() * 1000,
      v: (rng() < 0.5 ? -1 : 1) * (22 + rng() * 34),
    }
  })
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const p = new THREE.Vector3()
  const s = new THREE.Vector3(1, 1, 1)
  const up = new THREE.Vector3(0, 1, 0)
  return {
    object: mesh,
    update: (_t, dt) => {
      cars.forEach((c, i) => {
        c.t += c.v * dt
        if (c.t > 520) c.t = -520
        if (c.t < -520) c.t = 520
        if (c.alongZ) {
          p.set(c.lane, c.y, c.t)
          q.setFromAxisAngle(up, c.v > 0 ? 0 : Math.PI)
        } else {
          p.set(c.t, c.y, c.lane - 120)
          q.setFromAxisAngle(up, c.v > 0 ? Math.PI / 2 : -Math.PI / 2)
        }
        mesh.setMatrixAt(i, m4.compose(p, q, s))
      })
      mesh.instanceMatrix.needsUpdate = true
    },
  }
}

/** Slow searchlights sweeping the clouds. */
export function createSearchlights(): Animated {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uCol: { value: new THREE.Color('#8fb4ff') } },
    vertexShader: /* glsl */ `varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `varying float vY; uniform vec3 uCol; void main(){ gl_FragColor = vec4(uCol, (1.0 - vY) * 0.05 * smoothstep(0.0, 0.05, vY)); }`,
  })
  const geo = new THREE.CylinderGeometry(22, 1.2, 900, 16, 1, true).translate(0, 450, 0).rotateX(Math.PI)
  const group = new THREE.Group()
  const pivots = ([
    [-260, -380, 0],
    [220, -520, 2],
    [460, 200, 4],
  ] as const).map(([x, z, ph]) => {
    const piv = new THREE.Group()
    piv.position.set(x, 120, z)
    const cone = new THREE.Mesh(geo, mat)
    cone.rotation.x = Math.PI
    piv.add(cone)
    group.add(piv)
    return { piv, ph }
  })
  return {
    object: group,
    update: (t) => {
      for (const { piv, ph } of pivots) piv.rotation.set(Math.sin(t * 0.21 + ph) * 0.35, 0, 0.25 + Math.cos(t * 0.17 + ph) * 0.3)
    },
  }
}

/** Drifting motes around the focus point (the player). */
export function createMotes(rng: Rng, n = 260): Animated {
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) pos.set([(rng() - 0.5) * 50, rng() * 10, (rng() - 0.5) * 50], i * 3)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({ size: 0.05, map: radialTexture(), color: hdr('#9ff0ff', 0.7), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  const points = new THREE.Points(g, mat)
  points.frustumCulled = false
  return {
    object: points,
    update: (t, dt, c) => {
      const a = g.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < n; i++) {
        let px = a.getX(i) + Math.sin(t * 0.6 + i) * dt * 0.2
        let py = a.getY(i) + dt * 0.18
        let pz = a.getZ(i)
        if (py > 10) py = 0.2
        if (px - c.x > 25) px -= 50
        if (px - c.x < -25) px += 50
        if (pz - c.z > 25) pz -= 50
        if (pz - c.z < -25) pz += 50
        a.setXYZ(i, px, py, pz)
      }
      a.needsUpdate = true
    },
  }
}
