import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Vector3 } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'

// Camera placement relative to the target. World-space for now (no yaw).
// Mouse-look in M4 will rotate this offset around the target.
const OFFSET = new Vector3(0, 4, 7)
const LOOK_HEIGHT = 1.2 // look at upper body, not feet
const FOLLOW_RESPONSIVENESS = 5 // higher = snappier; lower = laggier

/**
 * Fortnite-style lazy-follow camera.
 *
 * Each frame, dampens position toward `target + OFFSET` and looks at the
 * target's upper body. Frame-rate-independent damping via `1 - exp(-k·dt)`.
 *
 * Pure spectator now — manual mouse drag override comes with MouseProducer.
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
    ideal.current.set(t.x + OFFSET.x, t.y + OFFSET.y, t.z + OFFSET.z)

    const k = 1 - Math.exp(-FOLLOW_RESPONSIVENESS * delta)
    camera.position.lerp(ideal.current, k)
    camera.lookAt(t.x, t.y + LOOK_HEIGHT, t.z)
  })

  return null
}
