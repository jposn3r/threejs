import { Grid } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
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

      {/* Floor — fixed rigid body so the player capsule has something to land on.
          40x1x40 box positioned so its top sits at y=0. */}
      <RigidBody type="fixed" position={[0, -0.5, 0]} colliders="cuboid">
        <mesh receiveShadow>
          <boxGeometry args={[40, 1, 40]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      </RigidBody>

      <Player />
    </>
  )
}
