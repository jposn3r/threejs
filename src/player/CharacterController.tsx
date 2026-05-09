import {
  CapsuleCollider,
  RigidBody,
  useRapier,
  type RapierCollider,
  type RapierRigidBody,
} from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import { Vector3 } from 'three'
import { inputState } from '@/input/InputState'

// Movement tuning — adjust by feel, not by spec.
const WALK_SPEED = 4 // m/s
const RUN_SPEED = 7 // m/s
const JUMP_VELOCITY = 6 // m/s upward impulse
const GRAVITY = -25 // m/s² (slightly stronger than real for "game feel")
const MAX_DT = 0.1 // cap delta to avoid tunneling on big frame drops

/**
 * Kinematic character controller.
 *
 * Owns a kinematic-position-based RigidBody with a capsule collider, plus a
 * Rapier `KinematicCharacterController` helper that handles slide-along-walls,
 * auto-step over small ledges, and snap-to-ground.
 *
 * Movement model:
 *  - Read intent from `inputState.move` (XZ plane, world-relative for now)
 *  - Apply gravity manually (kinematic bodies aren't subject to physics gravity)
 *  - Ask the controller to compute valid movement given collisions
 *  - setNextKinematicTranslation to the new position
 *
 * Camera-relative movement comes when MouseProducer + camera yaw land in M4.
 */
export function CharacterController({
  bodyRef,
}: {
  bodyRef: RefObject<RapierRigidBody>
}) {
  const { world } = useRapier()
  const colliderRef = useRef<RapierCollider>(null)

  const controller = useMemo(() => {
    const c = world.createCharacterController(0.01)
    c.setUp({ x: 0, y: 1, z: 0 })
    c.setApplyImpulsesToDynamicBodies(true)
    c.setMaxSlopeClimbAngle((45 * Math.PI) / 180)
    c.enableAutostep(0.5, 0.2, true)
    c.enableSnapToGround(0.5)
    return c
  }, [world])

  const verticalVelocity = useRef(0)
  const movement = useRef(new Vector3())

  useFrame((_, delta) => {
    if (!bodyRef.current || !colliderRef.current) return

    const dt = Math.min(delta, MAX_DT)
    const speed = inputState.run ? RUN_SPEED : WALK_SPEED

    // Horizontal movement (world-relative; camera-relative comes later)
    movement.current.set(
      inputState.move.x * speed * dt,
      0,
      inputState.move.y * speed * dt,
    )

    // Vertical: gravity + jump
    if (controller.computedGrounded()) {
      // Small downward bias keeps the controller snapping to slopes/ground
      verticalVelocity.current = -1
      if (inputState.jump) {
        verticalVelocity.current = JUMP_VELOCITY
        inputState.jump = false // consume edge trigger
      }
    } else {
      verticalVelocity.current += GRAVITY * dt
    }
    movement.current.y += verticalVelocity.current * dt

    // Resolve against world colliders
    controller.computeColliderMovement(colliderRef.current, movement.current)
    const computed = controller.computedMovement()

    const t = bodyRef.current.translation()
    bodyRef.current.setNextKinematicTranslation({
      x: t.x + computed.x,
      y: t.y + computed.y,
      z: t.z + computed.z,
    })
  })

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[0, 3, 5]}
    >
      {/* Capsule: half-height 0.5, radius 0.4 → total height ~1.8m */}
      <CapsuleCollider ref={colliderRef} args={[0.5, 0.4]} />
      <mesh castShadow>
        <capsuleGeometry args={[0.4, 1, 8, 16]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.15}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
    </RigidBody>
  )
}
