import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier, type RapierCollider, type RapierRigidBody } from '@react-three/rapier'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { inputState } from '@/input/InputState'
import { openInteractable } from '@/interaction/actions'
import { useInteraction } from '@/interaction/store'
import { radialTexture } from '@/render/canvas'
import type { ZoneDef } from '@/zones/types'
import { cameraState } from './cameraState'
import { computeMovement, MAX_DT } from './movement'
import { clearRoute, playerState } from './playerState'
import { VrmAvatar } from './VrmAvatar'

const CAPSULE_HALF = 0.5
const CAPSULE_RADIUS = 0.35
/** Body centre above the feet. */
const CENTER_Y = CAPSULE_HALF + CAPSULE_RADIUS
const KILL_Y = -30
const ARRIVE = 0.3

export const lerpAngle = (a: number, b: number, t: number) => {
  const d = ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI
  return a + d * t
}

/** Spawn at a named place of the zone, facing its look-at point. */
export function spawnAt(zone: ZoneDef, placeId: string) {
  const place = zone.places.find((p) => p.id === placeId) ?? zone.places.find((p) => p.id === zone.defaultPlace)!
  const [x, z] = place.spawn
  playerState.teleport = { x, z }
  playerState.position.set(x, 0, z)
  cameraState.yaw = Math.atan2(-(place.look[0] - x), -(place.look[1] - z))
  cameraState.pitch = place.pitch ?? 0.16
  playerState.facing = cameraState.yaw + Math.PI
  clearRoute()
  try {
    history.replaceState(null, '', `#${place.id}`)
  } catch {
    // sandboxed frames may refuse history writes
  }
}

/**
 * The traveler: a Rapier kinematic capsule driven by inputState (keyboard,
 * joystick) or, when there's no manual input, by the tap-to-walk route.
 * Movement math lives in movement.ts (unit tested).
 */
export function Traveler({ zone }: { zone: ZoneDef }) {
  const bodyRef = useRef<RapierRigidBody>(null)
  const colliderRef = useRef<RapierCollider>(null)
  const avatarRef = useRef<THREE.Group>(null)
  const blobRef = useRef<THREE.Mesh>(null)
  const { world } = useRapier()
  const vy = useRef(0)
  const move = useRef(new THREE.Vector3())

  const controller = useMemo(() => {
    const c = world.createCharacterController(0.01)
    c.setUp({ x: 0, y: 1, z: 0 })
    c.setMaxSlopeClimbAngle((45 * Math.PI) / 180)
    c.enableSnapToGround(0.5)
    c.enableAutostep(0.4, 0.2, true)
    return c
  }, [world])
  useEffect(() => () => world.removeCharacterController(controller), [world, controller])

  // spawn from the URL (#career, #visionquest …) and follow later hash changes
  useEffect(() => {
    const go = () => spawnAt(zone, location.hash.slice(1) || zone.defaultPlace)
    go()
    addEventListener('hashchange', go)
    return () => removeEventListener('hashchange', go)
  }, [zone])

  useFrame((_, delta) => {
    const body = bodyRef.current
    const col = colliderRef.current
    if (!body || !col) return
    const dt = Math.min(delta, MAX_DT)

    if (playerState.teleport) {
      const { x, z } = playerState.teleport
      body.setNextKinematicTranslation({ x, y: CENTER_Y + 0.02, z })
      playerState.teleport = null
      vy.current = 0
      return
    }
    const t = body.translation()
    if (t.y < KILL_Y) {
      spawnAt(zone, zone.defaultPlace)
      return
    }

    const uiOpen = useInteraction.getState().panel !== null
    let mx = uiOpen ? 0 : inputState.move.x
    let my = uiOpen ? 0 : inputState.move.y
    let run = !uiOpen && inputState.run
    const following = !uiOpen && mx === 0 && my === 0 && playerState.route.length > 0

    if (following) {
      const target = playerState.route[0]
      const dx = target.x - t.x
      const dz = target.z - t.z
      const dist = Math.hypot(dx, dz)
      if (dist < ARRIVE) {
        playerState.route.shift()
        if (!playerState.route.length && playerState.pendingOpen) {
          const id = playerState.pendingOpen
          playerState.pendingOpen = null
          openInteractable(zone, id)
        }
      } else {
        // world direction → camera-relative intent, so computeMovement stays the one source of truth
        const wx = dx / dist
        const wz = dz / dist
        const s = Math.sin(cameraState.yaw)
        const c = Math.cos(cameraState.yaw)
        mx = wx * c + wz * -s
        my = -(wx * -s + wz * -c)
        run = dist > 8 || playerState.route.length > 1
      }
    }

    const result = computeMovement(
      { moveX: mx, moveY: my, jump: !uiOpen && inputState.jump, run, cameraYaw: cameraState.yaw },
      { verticalVelocity: vy.current },
      controller.computedGrounded(),
      dt,
    )
    if (result.jumpConsumed || uiOpen) inputState.jump = false
    vy.current = result.verticalVelocity
    move.current.set(result.dx, result.dy, result.dz)
    controller.computeColliderMovement(col, move.current)
    const m = controller.computedMovement()
    body.setNextKinematicTranslation({ x: t.x + m.x, y: t.y + m.y, z: t.z + m.z })

    const wanted = Math.hypot(result.dx, result.dz)
    const got = Math.hypot(m.x, m.z)
    // a tap route that runs into something gives up instead of pushing forever
    if (following && wanted > 1e-3 && got < wanted * 0.15) clearRoute()

    playerState.position.set(t.x + m.x, t.y + m.y - CENTER_Y, t.z + m.z)
    playerState.speed = got / dt
    playerState.running = run
    if (wanted > 1e-4) playerState.facing = lerpAngle(playerState.facing, Math.atan2(result.dx, result.dz), 1 - Math.exp(-12 * dt))
    if (following && performance.now() - playerState.lastLook > 900) {
      cameraState.yaw = lerpAngle(cameraState.yaw, playerState.facing + Math.PI, 1 - Math.exp(-1.6 * dt))
    }

    avatarRef.current?.position.copy(playerState.position)
    avatarRef.current?.rotation.set(0, playerState.facing, 0)
    blobRef.current?.position.set(playerState.position.x, playerState.position.y + 0.03, playerState.position.z)
  })

  return (
    <>
      <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={[0, CENTER_Y + 0.02, 0]}>
        <CapsuleCollider ref={colliderRef} args={[CAPSULE_HALF, CAPSULE_RADIUS]} />
      </RigidBody>
      <group ref={avatarRef}>
        <Suspense fallback={null}>
          <VrmAvatar url="/models/traveler.vrm" />
        </Suspense>
      </group>
      <mesh ref={blobRef} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshBasicMaterial map={radialTexture()} color="#000000" transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </>
  )
}
