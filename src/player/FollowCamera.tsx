import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { inputState } from '@/input/InputState'
import type { ZoneDef } from '@/zones/types'
import { cameraState, DIST_MAX, DIST_MIN } from './cameraState'
import { playerState } from './playerState'

const TARGET_HEIGHT = 1.35
const FOLLOW = 10 // higher = snappier
const SNAP_DISTANCE = 25 // teleports snap instead of swooping

/** Third-person orbit camera with lazy follow, zoom, and the zone's roof clamp. */
export function FollowCamera({ zone }: { zone: ZoneDef }) {
  const target = useRef(new Vector3())
  const ideal = useRef(new Vector3())

  useFrame(({ camera }, delta) => {
    if (inputState.zoom) {
      cameraState.dist = Math.min(DIST_MAX, Math.max(DIST_MIN, cameraState.dist + inputState.zoom * 0.01))
      inputState.zoom = 0
    }
    const p = playerState.position
    target.current.set(p.x, p.y + TARGET_HEIGHT, p.z)
    const cp = Math.cos(cameraState.pitch)
    ideal.current.set(
      target.current.x + Math.sin(cameraState.yaw) * cp * cameraState.dist,
      target.current.y + Math.sin(cameraState.pitch) * cameraState.dist + 0.3,
      target.current.z + Math.cos(cameraState.yaw) * cp * cameraState.dist,
    )
    ideal.current.y = Math.max(0.35, Math.min(ideal.current.y, zone.cameraCeiling(ideal.current.x, ideal.current.z)))
    if (camera.position.distanceTo(ideal.current) > SNAP_DISTANCE) camera.position.copy(ideal.current)
    else camera.position.lerp(ideal.current, 1 - Math.exp(-FOLLOW * Math.min(delta, 0.1)))
    camera.lookAt(target.current)
  })

  return null
}
