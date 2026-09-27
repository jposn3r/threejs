import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { inputState } from '@/input/InputState'
import { playerState } from '@/player/playerState'
import { PAL, hdr } from '@/render/palette'
import { world } from '@/zones/world'
import type { ZoneDef } from '@/zones/types'
import { planRoute, regionOf } from './route'
import { useInteraction } from './store'

/**
 * Turns taps/clicks into walking: tap a landmark to walk to it and open it,
 * tap the floor to walk there. Routes follow the zone's walk graph.
 * Also draws the pulsing destination ring.
 */
export function TapRouter({ zone }: { zone: ZoneDef }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const marker = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (inputState.taps.length) {
      const tap = inputState.taps[inputState.taps.length - 1]
      inputState.taps.length = 0
      const inst = world.instance
      if (inst && !useInteraction.getState().panel) {
        ndc.set((tap.x / size.width) * 2 - 1, -(tap.y / size.height) * 2 + 1)
        ray.setFromCamera(ndc, camera)
        const hits = ray.intersectObjects([...inst.hitTargets.map((h) => h.object), ...inst.floors], false)
        if (hits.length) {
          const hit = hits[0]
          const target = inst.hitTargets.find((h) => h.object === hit.object)
          const spec = target && zone.interactables.find((i) => i.id === target.id)
          const dest = spec ? { x: spec.at[0], z: spec.at[1] } : { x: hit.point.x, z: hit.point.z }
          if (spec || regionOf(zone.walk, dest.x, dest.z) >= 0) {
            const route = planRoute(zone.walk, playerState.position, dest)
            if (route.length) {
              playerState.route = route
              playerState.pendingOpen = spec ? spec.id : null
              marker.current?.position.set(dest.x, 0.04, dest.z)
            }
          }
        }
      }
    }
    const m = marker.current
    if (m) {
      m.visible = playerState.route.length > 0
      if (m.visible) (m.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.4 * Math.sin(clock.elapsedTime * 6)
    }
  })

  return (
    <mesh ref={marker} rotation-x={-Math.PI / 2} visible={false}>
      <ringGeometry args={[0.3, 0.38, 40]} />
      <meshBasicMaterial color={hdr(PAL.yellow, 1)} transparent depthWrite={false} />
    </mesh>
  )
}
