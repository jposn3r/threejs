import { useEffect, useRef, type RefObject } from 'react'
import { cameraState, PITCH_MAX, PITCH_MIN } from '@/player/cameraState'
import { clearRoute, playerState } from '@/player/playerState'
import { inputState } from './InputState'

const JOY_RADIUS = 52 // px the knob can travel
const TAP_SLOP = 10 // px of movement still counted as a tap
const TAP_TIME = 350 // ms

/**
 * Mouse + touch input on the 3D stage.
 *
 *  - Mouse: drag to look, click to walk there (or to a tapped landmark),
 *    wheel to zoom.
 *  - Touch: a floating joystick appears under a thumb on the left 45% of the
 *    screen; drag anywhere else to look; tap to walk / open.
 *
 * Renders the joystick visual; everything else writes to inputState /
 * cameraState / playerState.
 */
export function PointerProducer({ target }: { target: RefObject<HTMLElement> }) {
  const joyRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = target.current
    if (!el) return
    type Ptr = { role: 'look' | 'joy'; x: number; y: number; t0: number; moved: number }
    const pointers = new Map<number, Ptr>()
    const joy = { id: null as number | null, ox: 0, oy: 0 }

    const showJoy = (x: number, y: number) => {
      const j = joyRef.current
      if (!j) return
      j.style.left = `${x}px`
      j.style.top = `${y}px`
      j.hidden = false
      if (knobRef.current) knobRef.current.style.transform = ''
    }
    const hideJoy = () => {
      if (joyRef.current) joyRef.current.hidden = true
    }

    const onDown = (e: PointerEvent) => {
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        // capture is best-effort
      }
      const role: Ptr['role'] = e.pointerType === 'touch' && e.clientX < innerWidth * 0.45 && joy.id === null ? 'joy' : 'look'
      pointers.set(e.pointerId, { role, x: e.clientX, y: e.clientY, t0: performance.now(), moved: 0 })
      if (role === 'joy') {
        joy.id = e.pointerId
        joy.ox = e.clientX
        joy.oy = e.clientY
        clearRoute()
        showJoy(e.clientX, e.clientY)
      }
    }

    const onMove = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId)
      if (!p) return
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      p.x = e.clientX
      p.y = e.clientY
      p.moved += Math.abs(dx) + Math.abs(dy)
      if (p.role === 'look') {
        const k = e.pointerType === 'touch' ? 0.0065 : 0.0045
        cameraState.yaw -= dx * k
        cameraState.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, cameraState.pitch + dy * k * 0.8))
        if (p.moved > TAP_SLOP) playerState.lastLook = performance.now()
      } else {
        let jx = e.clientX - joy.ox
        let jy = e.clientY - joy.oy
        const len = Math.hypot(jx, jy)
        if (len > JOY_RADIUS) {
          jx *= JOY_RADIUS / len
          jy *= JOY_RADIUS / len
        }
        if (knobRef.current) knobRef.current.style.transform = `translate(${jx}px, ${jy}px)`
        inputState.move.set(jx / JOY_RADIUS, jy / JOY_RADIUS)
        inputState.run = Math.hypot(jx, jy) / JOY_RADIUS > 0.92
      }
    }

    const onUp = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId)
      if (!p) return
      pointers.delete(e.pointerId)
      if (p.role === 'joy') {
        joy.id = null
        inputState.move.set(0, 0)
        inputState.run = false
        hideJoy()
        return
      }
      if (e.type === 'pointerup' && p.moved < TAP_SLOP && performance.now() - p.t0 < TAP_TIME) {
        const rect = el.getBoundingClientRect()
        inputState.taps.push({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      inputState.zoom += e.deltaY
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [target])

  return (
    <div
      ref={joyRef}
      hidden
      className="pointer-events-none fixed z-30 -ml-[60px] -mt-[60px] h-[120px] w-[120px] rounded-full border-[1.5px] border-neon-cyan/60 bg-[radial-gradient(circle,rgba(63,242,255,.12),rgba(63,242,255,.02)_70%)]"
    >
      <div ref={knobRef} className="absolute left-1/2 top-1/2 -ml-[23px] -mt-[23px] h-[46px] w-[46px] rounded-full border-[1.5px] border-neon-cyan bg-neon-cyan/30" />
    </div>
  )
}
