/**
 * Single shared input state. Producers (keyboard, pointer/touch, later
 * gamepad and XR) write to it; consumers (traveler, camera, tap router)
 * read it every frame in useFrame.
 *
 * Intentionally a mutable singleton, not a store: input is read every frame
 * and must never cause React renders.
 */
import { Vector2 } from 'three'

export interface InputState {
  /** Camera-relative movement intent. y = −1 is forward. Magnitude ≤ 1. */
  move: Vector2
  /** Edge-triggered: consumers reset to false. */
  jump: boolean
  /** Held. */
  run: boolean
  /** Edge-triggered: consumers reset to false. */
  interact: boolean
  /** Accumulated zoom (wheel delta units); the camera consumes and zeroes it. */
  zoom: number
  /** Screen-space taps/clicks (CSS px) waiting for the tap router. */
  taps: { x: number; y: number }[]
}

export const inputState: InputState = {
  move: new Vector2(),
  jump: false,
  run: false,
  interact: false,
  zoom: 0,
  taps: [],
}
