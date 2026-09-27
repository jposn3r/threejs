import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, useEffect, useRef, useState } from 'react'
import { KeyboardProducer } from '@/input/KeyboardProducer'
import { PointerProducer } from '@/input/PointerProducer'
import { Proximity } from '@/interaction/Proximity'
import { TapRouter } from '@/interaction/TapRouter'
import { FollowCamera } from '@/player/FollowCamera'
import { Traveler } from '@/player/Traveler'
import { PerfMeter, PostFX, ShaderClock } from '@/render/PostFX'
import { maxDpr, useQuality } from '@/render/quality'
import { DEFAULT_ZONE, zones } from '@/zones/registry'
import type { ZoneDef } from '@/zones/types'
import { ZoneMount } from '@/zones/ZoneMount'
import { Hud } from './Hud'
import { Loader } from './Loader'
import { PanelHost } from './PanelHost'
import { useUi } from './uiStore'

/** Signage is drawn into canvases, so its fonts must be ready before the zone builds. */
function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const fonts = ['700 64px "Chakra Petch"', '500 20px "IBM Plex Mono"', '700 64px "Noto Sans JP"'].map((f) =>
      document.fonts.load(f, f.includes('Noto') ? '中央駅' : 'A'),
    )
    const timeout = new Promise((r) => setTimeout(r, 3000))
    Promise.race([Promise.allSettled(fonts), timeout]).then(() => setReady(true))
  }, [])
  return ready
}

function World({ zone }: { zone: ZoneDef }) {
  return (
    <>
      <ShaderClock />
      <Physics>
        <ZoneMount def={zone} />
        <Traveler zone={zone} />
      </Physics>
      <FollowCamera zone={zone} />
      <Proximity zone={zone} />
      <TapRouter zone={zone} />
      <PostFX />
      <PerfMeter />
    </>
  )
}

export default function App() {
  const stage = useRef<HTMLDivElement>(null)
  const fontsReady = useFontsReady()
  const quality = useQuality((s) => s.quality)
  const zone = zones[useUi((s) => s.zoneId)] ?? zones[DEFAULT_ZONE]

  return (
    <div className="fixed inset-0 bg-ink">
      <div ref={stage} className="absolute inset-0 touch-none">
        {fontsReady && (
          <Canvas
            dpr={[1, maxDpr(quality)]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            camera={{ fov: 50, near: 0.1, far: 4000, position: [0, 3, 8] }}
          >
            <Suspense fallback={null}>
              <World zone={zone} />
            </Suspense>
          </Canvas>
        )}
      </div>
      <KeyboardProducer />
      <PointerProducer target={stage} />
      <Hud zone={zone} />
      <PanelHost />
      <Loader />
    </div>
  )
}
