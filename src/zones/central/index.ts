import * as THREE from 'three'
import { createCanalCity } from '@/city/canalCity'
import { createSky } from '@/render/sky'
import { PAL } from '@/render/palette'
import type { ZoneDef, ZoneInstance } from '../types'
import { INTERACTABLES, PLACES, WALK, cameraCeiling, colliders, placeAt } from './layout'
import { buildStation } from './station'

/** Where the moon hangs: above the skyline, off the canal's right bank. */
export const MOON_DIR = new THREE.Vector3(0.28, 0.42, -1).normalize()

export const centralZone: ZoneDef = {
  id: 'central',
  walk: WALK,
  colliders: colliders(),
  interactables: INTERACTABLES,
  places: PLACES,
  defaultPlace: 'central',
  placeAt: (x) => placeAt(x),
  cameraCeiling,
  build(): ZoneInstance {
    const group = new THREE.Group()
    group.name = 'zone-central'

    group.add(new THREE.HemisphereLight('#5a66e8', '#c23f8f', 0.7))
    const moon = new THREE.DirectionalLight('#c3d2ff', 1.0)
    moon.position.copy(MOON_DIR).multiplyScalar(100)
    group.add(moon)

    const sky = createSky(MOON_DIR)
    group.add(sky)

    const city = createCanalCity()
    const station = buildStation()
    group.add(city.group, station.group)

    return {
      group,
      sky,
      fog: new THREE.FogExp2(PAL.fog, 0.0011),
      hitTargets: station.hitTargets,
      floors: station.floors,
      update(t, dt, focus) {
        city.update(t, dt, focus)
        station.update(t, dt)
      },
      setQuality: (high) => city.water.setQuality(high),
      setSize: (w, h, dpr) => city.water.setSize(w, h, dpr),
      dispose() {
        city.dispose()
        group.traverse((o) => {
          const mesh = o as THREE.Mesh
          mesh.geometry?.dispose()
        })
      },
    }
  },
}
