import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { KeyboardProducer } from './input/KeyboardProducer'
import { MouseProducer } from './input/MouseProducer'
import { usePointerLock } from './input/usePointerLock'
import { SandboxScene } from './scenes/sandbox/Scene'

export default function App() {
  const locked = usePointerLock()

  return (
    <div className="relative h-full w-full">
      {/* Input producers — render nothing, attach window listeners */}
      <KeyboardProducer />
      <MouseProducer />

      {/* HUD overlay — dark glass aesthetic */}
      <div className="absolute left-4 top-4 z-10 select-none rounded-md border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.2em] text-accent-400">
          metakaizen
        </div>
        <div className="text-sm text-white/70">v1 · sandbox</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
          WASD move · Shift run · Space jump
        </div>
      </div>

      {/* Pointer-lock CTA — center-bottom, only when not locked */}
      {!locked && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 select-none rounded-md border border-accent-500/40 bg-black/60 px-4 py-2 backdrop-blur-md">
          <div className="text-xs uppercase tracking-widest text-accent-400">
            Click to look around
          </div>
        </div>
      )}

      {/* Esc-to-release hint — top-right, only when locked */}
      {locked && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 select-none rounded-md border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-widest text-white/40">
            Esc to release mouse
          </div>
        </div>
      )}

      {/* 3D canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <Physics>
          <SandboxScene />
        </Physics>
      </Canvas>
    </div>
  )
}
