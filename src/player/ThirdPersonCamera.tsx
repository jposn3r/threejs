import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Vector3 } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import { cameraState } from './cameraState'

const FOLLOW_DISTANCE = 7
const CAMERA_HEIGHT = 2.7 // above player base
const LOOK_HEIGHT = 1.2 // chest height target
const FOLLOW_RESPONSIVENESS = 8 // higher = snappier; lower = laggier

/**
 * Fortnite-style lazy-follow camera with mouse-look.
 *
 * Position: orbits the player at fixed distance + height. Horizontal angle
 * comes from cameraState.yaw — when the player drags the mouse, this rotates
 * which side of the player the camera sits on.
 *
 * Look-at: aimed at the player's chest, with vertical offset from
 * cameraState.pitch so mouse-up makes the view tilt up. We use tan(pitch)
 * scaled by FOLLOW_DISTANCE so pitch corresponds (approximately) to the
 * actual camera tilt angle.
 *
 * Damping: frame-rate-independent exponential lerp on position.
 * Look-at snaps directly because lagged look-at causes nauseating
 * camera-feel mismatch when paired with mouse-look.
 */
export function ThirdPersonCamera({
  targetRef,
}: {
  targetRef: RefObject<RapierRigidBody>
}) {
  const camera = useThree((s) => s.camera)
  const ideal = useRef(new Vector3())

  useFrame((_, delta) => {
    if (!targetRef.current) return

    const t = targetRef.current.translation()
    const yaw = cameraState.yaw
    const pitch = cameraState.pitch

    // Camera orbit position around player
    ideal.current.set(
      t.x + Math.sin(yaw) * FOLLOW_DISTANCE,
      t.y + CAMERA_HEIGHT,
      t.z + Math.cos(yaw) * FOLLOW_DISTANCE,
    )

    const k = 1 - Math.exp(-FOLLOW_RESPONSIVENESS * delta)
    camera.position.lerp(ideal.current, k)

    // Look target — vertical offset from pitch
    const lookY = t.y + LOOK_HEIGHT + Math.tan(pitch) * FOLLOW_DISTANCE
    camera.lookAt(t.x, lookY, t.z)
  })

  return null
}
