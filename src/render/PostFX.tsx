import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { NeutralToneMapping } from 'three'
import { useUi } from '@/app/uiStore'
import { createPost } from './post'
import { useQuality } from './quality'
import { time } from './time'

/** Takes over rendering (priority 1) and draws through the post stack. */
export function PostFX() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const quality = useQuality((s) => s.quality)
  const post = useMemo(() => createPost(gl, scene, camera, quality), [gl, scene, camera, quality])
  const first = useRef(true)

  useEffect(() => () => post.dispose(), [post])
  useEffect(() => post.setSize(size.width, size.height), [post, size, dpr])

  useFrame(() => {
    // R3F may reset tone mapping when the canvas reconfigures (e.g. DPR change)
    gl.toneMapping = NeutralToneMapping
    post.composer.render()
    if (first.current) {
      first.current = false
      useUi.getState().setReady()
    }
  }, 1)

  return null
}

const reducedMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Advances the shared shader clock before anything else reads it. */
export function ShaderClock() {
  useFrame((_, delta) => {
    time.value += Math.min(delta, 0.1) * (reducedMotion ? 0.3 : 1)
  }, -1)
  return null
}

/** Frames per second for the HUD, sampled every half second. */
export function PerfMeter() {
  const acc = useRef({ frames: 0, t: 0 })
  useFrame((_, delta) => {
    const a = acc.current
    a.frames++
    a.t += delta
    if (a.t >= 0.5) {
      const fps = Math.round(a.frames / a.t)
      if (useUi.getState().fps !== fps) useUi.getState().setFps(fps)
      a.frames = 0
      a.t = 0
    }
  })
  return null
}
