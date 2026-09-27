import * as THREE from 'three'
import { mulberry32 } from '@/lib/rng'
import { facadeMaterial, towerMaterial } from '@/render/windows'
import { cel, glow } from '@/render/materials'
import { PAL, hdr } from '@/render/palette'
import { UNIT_BOX } from './kit'
import { CANAL, GROUND_Y, layoutCanalCity } from './layout'
import { createScreens } from './screens'
import { createCanalWater } from './water'
import { createBeacons, createHaze, createMotes, createSearchlights, createStreet, createTraffic, type Animated } from './atmosphere'

/**
 * Assembles the Central district's city from the pure layout: merged
 * buildings (3 draw calls), the far skyline (1 instanced draw), screens,
 * water, haze and the moving parts.
 */
export function createCanalCity(seed = 2077) {
  const layout = layoutCanalCity(seed)
  const rng = mulberry32(seed + 1)
  const group = new THREE.Group()
  group.name = 'canal-city'

  // merged buildings + megastructures
  const merged = layout.ctx.kit.merge()
  const parts: [THREE.BufferGeometry | null, THREE.Material][] = [
    [merged.facade, facadeMaterial()],
    [merged.trim, cel('#10143a')],
    [merged.glow, new THREE.MeshBasicMaterial({ vertexColors: true })],
  ]
  for (const [geo, mat] of parts) if (geo) group.add(new THREE.Mesh(geo, mat))

  // bridge cables
  const cableGeo = new THREE.BufferGeometry()
  cableGeo.setAttribute('position', new THREE.Float32BufferAttribute(layout.cables, 3))
  group.add(new THREE.LineSegments(cableGeo, new THREE.LineBasicMaterial({ color: hdr('#6d86d8', 0.8) })))

  // far skyline, one instanced draw
  const far = new THREE.InstancedMesh(UNIT_BOX, towerMaterial(), layout.farParts.length)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const p = new THREE.Vector3()
  const s = new THREE.Vector3()
  layout.farParts.forEach(([x, y, z, w, h, d], i) => far.setMatrixAt(i, m4.compose(p.set(x, y, z), q, s.set(w, h, d))))
  group.add(far)

  // the megatower's light signature: a V at the crown and a line down its face
  const { mega } = layout
  const lineMat = glow(PAL.white, 1.3)
  for (const sgn of [-1, 1]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2, 80, 2), lineMat)
    bar.position.set(mega.x + sgn * 12, mega.top - 28, mega.z + mega.w * 0.4 + 1.5)
    bar.rotation.z = sgn * 0.42
    group.add(bar)
  }
  const line = new THREE.Mesh(new THREE.BoxGeometry(1.4, 330, 1.4), lineMat)
  line.position.set(mega.x, mega.top - 240, mega.z + mega.w * 0.4 + 1.5)
  group.add(line)

  group.add(createScreens(layout.ctx.signs))

  const water = createCanalWater({ half: CANAL.half, z0: CANAL.z0, z1: CANAL.z1, y: GROUND_Y - 2.2 })
  group.add(water.group)

  const animated: Animated[] = [
    createStreet(GROUND_Y),
    createBeacons(layout.ctx.beacons),
    createHaze(GROUND_Y),
    createTraffic(rng),
    createSearchlights(),
    createMotes(rng),
  ]
  for (const a of animated) group.add(a.object)

  return {
    group,
    water,
    stats: { signs: layout.ctx.signs.length, farTowers: layout.farTowers.length },
    update(t: number, dt: number, focus: THREE.Vector3) {
      for (const a of animated) a.update?.(t, dt, focus)
    },
    dispose() {
      water.dispose()
      group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry && mesh.geometry !== UNIT_BOX) mesh.geometry.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose()
      })
    },
  }
}

export type CanalCity = ReturnType<typeof createCanalCity>
