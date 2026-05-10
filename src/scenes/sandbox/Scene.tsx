import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Player } from '@/player/Player'
import { InteractTrigger } from '@/interaction/InteractTrigger'
import { RaycastTarget } from '@/interaction/RaycastTarget'
import { MatrixDojo } from './MatrixDojo'
import { TestSpecimen } from './TestSpecimen'

/**
 * Sandbox scene — Matrix Dojo environment + player.
 *
 * The dojo provides its own floor + walls geometry (loaded as a trimesh
 * collider). We keep an invisible safety floor far below in case the
 * player ever falls off or through (kill-plane respawn handles the
 * extreme case in CharacterController).
 */
export function SandboxScene() {
  return (
    <>
      {/* Background + atmospheric fog */}
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 25, 70]} />

      {/* Lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[10, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* The dojo — visual only, no collision (trimesh was too heavy and
          wedged the player). Walls come back as hand-tuned cuboids once
          movement is confirmed working. */}
      <MatrixDojo />

      {/* Floor collider. Top at y=0. */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <CuboidCollider args={[50, 0.5, 50]} />
      </RigidBody>

      {/* Walls + ceiling. Pulled 1.5 units inward from the dojo bbox so the
          player capsule stops with breathing room before the visible
          geometry. Interior pillars are walk-through for v0; we'll
          revisit when the asset pipeline lands per-mesh collision. */}
      <RigidBody type="fixed">
        {/* Left wall (-X) */}
        <CuboidCollider args={[0.5, 6, 13.5]} position={[-17, 6, 0.8]} />
        {/* Right wall (+X) */}
        <CuboidCollider args={[0.5, 6, 13.5]} position={[17, 6, 0.8]} />
        {/* Back wall (-Z) */}
        <CuboidCollider args={[17, 6, 0.5]} position={[0, 6, -13]} />
        {/* Front wall (+Z) */}
        <CuboidCollider args={[17, 6, 0.5]} position={[0, 6, 14.5]} />
        {/* Ceiling */}
        <CuboidCollider args={[17, 0.5, 13.5]} position={[0, 12.5, 0.8]} />
      </RigidBody>

      <Player />

      {/* Interaction system — raycast each frame, fire E to open detail */}
      <RaycastTarget />
      <InteractTrigger />

      {/* Test interactable — replaced by proper specimens next commit */}
      <TestSpecimen />
    </>
  )
}
