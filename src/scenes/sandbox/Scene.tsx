import { Grid } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Player } from '@/player/Player'

/**
 * Sandbox scene — flat floor + lighting + grid + player.
 *
 * Temporary playground for Milestone 3. Becomes the basis for the hub
 * scene in M5 once we have rooms/walls/doors.
 */
export function SandboxScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[10, 12, 6]}
        intensity={1.4}
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

      {/* Visible grid (no collision — purely visual) */}
      <Grid
        position={[0, 0.01, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1f2937"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#10b981"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Floor — fixed rigid body. Top of collider sits at y=0 so the player
          capsule rests on the visible surface.

          Explicit CuboidCollider (half-extents) instead of `colliders="cuboid"`
          auto-detect — the auto-version has been flaky here. Floor is also
          made thicker (4 units) than visually needed to defeat any chance of
          tunneling on big frame drops. */}
      <RigidBody type="fixed" position={[0, -2, 0]}>
        <CuboidCollider args={[20, 2, 20]} />
        <mesh receiveShadow>
          <boxGeometry args={[40, 4, 40]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      </RigidBody>

      <Player />
    </>
  )
}
