import { Interactable } from '@/interaction/Interactable'

/**
 * Temporary specimen for proving out the interaction loop end-to-end.
 * Replaced in the next commit by proper vehicle/weapon pedestals.
 *
 * No outline glow yet — drei's <Outlines> inverted-shell approach renders
 * the whole screen green from inside the shell at our camera distance.
 * Will revisit with real models (per-mesh outline shader or postprocessing
 * OutlineEffect after bloom/tone mapping land in M9).
 */
export function TestSpecimen() {
  return (
    <Interactable
      id="test-specimen"
      title="Test Specimen"
      description="Proof-of-life interactable. Replaced soon."
      ctaLabel="Acknowledge"
      onCTA={() => console.log('CTA clicked')}
    >
      <mesh position={[3, 1, 3]} castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
    </Interactable>
  )
}
