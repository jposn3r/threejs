import { Interactable } from '@/interaction/Interactable'

/**
 * Hub specimens — one hero placeholder per future destination scene.
 * Pattern: museum-style pedestal + the specimen itself. Pedestal is
 * decorative only; the specimen mesh is wrapped in <Interactable> so
 * that's what triggers the prompt and detail view.
 *
 * Real models drop in at M7 when we have actual hangar/dojo content;
 * the geometry below is intentionally abstract for v0.
 */

const PEDESTAL_HEIGHT = 0.7
const PEDESTAL_TOP_Y = PEDESTAL_HEIGHT // top surface y (pedestal sits y=0..0.7)
const PEDESTAL_CENTER_Y = PEDESTAL_HEIGHT / 2

function Pedestal({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[0.6, 0.7, PEDESTAL_HEIGHT, 24]} />
      <meshStandardMaterial color="#171717" roughness={0.6} metalness={0.5} />
    </mesh>
  )
}

function VehicleSpecimen() {
  const x = -4
  const z = 0
  return (
    <>
      <Pedestal position={[x, PEDESTAL_CENTER_Y, z]} />
      <Interactable
        id="hub-vehicle"
        title="Vehicle"
        description="A single specimen on display. The hangar holds every vehicle in the collection — cars, planes, ships."
        ctaLabel="Visit the Hangar"
        onCTA={() => console.log('would navigate to /hangar')}
      >
        <mesh position={[x, PEDESTAL_TOP_Y + 0.3, z]} castShadow>
          {/* Low elongated body — concept-car silhouette */}
          <boxGeometry args={[1.6, 0.5, 0.9]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.15}
            roughness={0.35}
            metalness={0.7}
          />
        </mesh>
      </Interactable>
    </>
  )
}

function WeaponSpecimen() {
  const x = 4
  const z = 0
  // Tall thin blades are hard to aim at — give the player a generous
  // invisible cylinder hitbox covering the full pedestal+blade height.
  // Visible blade stays small.
  const HITBOX_RADIUS = 0.6
  const HITBOX_HEIGHT = 2.5 // pedestal (0.7) + blade headroom
  return (
    <>
      <Pedestal position={[x, PEDESTAL_CENTER_Y, z]} />
      <Interactable
        id="hub-weapon"
        title="Weapon"
        description="One of many on display. The dojo holds the full collection of blades and weapons."
        ctaLabel="Visit the Dojo"
        onCTA={() => console.log('would navigate to /dojo')}
      >
        {/* Invisible raycast proxy — fully transparent material so it
            renders nothing, but visible=true so Raycaster picks it up. */}
        <mesh position={[x, HITBOX_HEIGHT / 2, z]}>
          <cylinderGeometry
            args={[HITBOX_RADIUS, HITBOX_RADIUS, HITBOX_HEIGHT, 16]}
          />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Visible blade */}
        <mesh position={[x, PEDESTAL_TOP_Y + 0.9, z]} castShadow>
          <boxGeometry args={[0.06, 1.8, 0.14]} />
          <meshStandardMaterial
            color="#e5e7eb"
            emissive="#10b981"
            emissiveIntensity={0.25}
            roughness={0.2}
            metalness={0.95}
          />
        </mesh>
      </Interactable>
    </>
  )
}

export function HubSpecimens() {
  return (
    <>
      <VehicleSpecimen />
      <WeaponSpecimen />
    </>
  )
}
