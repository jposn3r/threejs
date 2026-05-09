import { useEffect } from 'react'
import { cameraState, PITCH_MAX, PITCH_MIN } from '@/player/cameraState'

// Radians per pixel. ~0.002 lands close to standard FPS feel.
// Settings slider in M11 will expose this.
const SENSITIVITY = 0.002

/**
 * Mouse input producer — pointer lock + mouse delta → cameraState.
 *
 * Click anywhere on the page to lock the pointer. While locked, mouse delta
 * rotates the camera (yaw + pitch). Browser releases the lock on Escape;
 * we listen for `pointerlockchange` to keep state consistent.
 *
 * Renders nothing.
 */
export function MouseProducer() {
  useEffect(() => {
    const onClick = () => {
      if (!document.pointerLockElement) {
        const canvas = document.querySelector('canvas')
        canvas?.requestPointerLock()
      }
    }

    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return
      // Mouse right (movementX > 0): yaw decreases → camera orbits to player's
      // left → view direction rotates to the right. (See cameraState.ts.)
      cameraState.yaw -= e.movementX * SENSITIVITY
      // Mouse up (movementY < 0): pitch increases → look up.
      cameraState.pitch -= e.movementY * SENSITIVITY
      if (cameraState.pitch > PITCH_MAX) cameraState.pitch = PITCH_MAX
      if (cameraState.pitch < PITCH_MIN) cameraState.pitch = PITCH_MIN
    }

    document.addEventListener('click', onClick)
    document.addEventListener('mousemove', onMove)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  return null
}
