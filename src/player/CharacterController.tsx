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
import { cameraState } from './cameraState'
import { computeMovement, MAX_DT } from './movement'

// Spawn above the dojo's interior floor. Bbox min y=-6 is the exterior/
// foundation bottom; the interior walking floor is around y=0 in world
// coords (the model's natural ground level). Spawning at y=2 lets us
// drop ~2m onto it.
const SPAWN = { x: 0, y: 2, z: 0 }
const KILL_PLANE_Y = -30

/**
 * Kinematic character controller.
 *
 * Owns a kinematic-position-based RigidBody + capsule collider + Rapier
 * `KinematicCharacterController` helper for collision resolution.
 *
 * Movement logic is delegated to `computeMovement` (pure function, tested in
 * movement.test.ts). This component is the wiring layer: it reads inputState,
 * calls computeMovement, runs the result through Rapier's collision solver,
 * and applies the floor clamp.
 *
 * Grounded detection is position-based (y at or near FLOOR_CLAMP_Y) rather
 * than relying on `controller.computedGrounded()`. The Rapier flag was
 * unreliable without a constant downward bias in our movement, and the bias
 * itself caused tunneling on speed transitions. For the flat sandbox floor,
 * position check is bulletproof. Real scenes with varied geometry will need
 * the controller-based check (re-introduced when we have terrain to test it).
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
    // Re-enabled for environments with real geometry. Trimesh floors have
    // tiny seams that snap-to-ground papers over; auto-step lets us climb
    // small lips/thresholds (doors, raised platforms).
    c.enableSnapToGround(0.5)
    c.enableAutostep(0.5, 0.2, true)
    return c
  }, [world])

  const verticalVelocity = useRef(0)
  const movement = useRef(new Vector3())

  useFrame((_, delta) => {
    if (!bodyRef.current || !colliderRef.current) return

    // Respawn if we've fallen off / through the world
    const t = bodyRef.current.translation()
    if (t.y < KILL_PLANE_Y) {
      bodyRef.current.setNextKinematicTranslation(SPAWN)
      verticalVelocity.current = 0
      return
    }

    const dt = Math.min(delta, MAX_DT)
    // Use Rapier's grounded flag now that we have real geometry — the
    // position-based check from the flat sandbox doesn't generalize.
    const grounded = controller.computedGrounded()

    // Pure logic — see movement.ts
    const result = computeMovement(
      {
        moveX: inputState.move.x,
        moveY: inputState.move.y,
        jump: inputState.jump,
        run: inputState.run,
        cameraYaw: cameraState.yaw,
      },
      { verticalVelocity: verticalVelocity.current },
      grounded,
      dt,
    )

    if (result.jumpConsumed) inputState.jump = false
    verticalVelocity.current = result.verticalVelocity

    movement.current.set(result.dx, result.dy, result.dz)

    // Resolve against world colliders
    controller.computeColliderMovement(colliderRef.current, movement.current)
    const computed = controller.computedMovement()

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
      position={[SPAWN.x, SPAWN.y, SPAWN.z]}
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
