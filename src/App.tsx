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

      {/* Reticle — center of screen, only when locked. Indicates where the
          camera is looking; later doubles as the interact target. */}
      {locked && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-5 w-5">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-accent-400/40" />
            {/* Center dot */}
            <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          </div>
        </div>
      )}

      {/* Asset attribution — required by CC-BY-4.0. Will be replaced by a
          proper Credits panel in settings once we have multiple assets. */}
      <div className="pointer-events-auto absolute bottom-2 right-2 z-10 select-text text-[10px] text-white/30">
        env:{' '}
        <a
          href="https://sketchfab.com/3d-models/matrix-dojo-replica-b311ef14fc7c4c5ab28ba74176c4ffa6"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/60"
        >
          Matrix Dojo Replica
        </a>{' '}
        by{' '}
        <a
          href="https://sketchfab.com/imanboer"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/60"
        >
          imanboer
        </a>{' '}
        ·{' '}
        <a
          href="http://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/60"
        >
          CC-BY-4.0
        </a>
      </div>

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
