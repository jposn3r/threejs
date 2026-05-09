import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

/**
 * Proof-of-life rotating cube.
 * Replaced as we build out scenes/hub/Scene.tsx in Milestone 5.
 */
function SpinningCube() {
  const ref = useRef<Mesh>(null!)
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.5
    ref.current.rotation.y += delta * 0.7
  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.15}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}

export default function App() {
  return (
    <div className="relative h-full w-full">
      {/* HUD overlay — dark glass aesthetic baseline */}
      <div className="absolute left-4 top-4 z-10 select-none rounded-md border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.2em] text-accent-400">
          metakaizen
        </div>
        <div className="text-sm text-white/70">v1 · proof of life</div>
      </div>

      {/* 3D canvas */}
      <Canvas
        camera={{ position: [3, 2, 3], fov: 60 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <SpinningCube />
      </Canvas>
    </div>
  )
}
