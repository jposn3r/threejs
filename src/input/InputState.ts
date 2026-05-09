/**
 * Single shared input state. Multiple producers (keyboard, mouse, touch,
 * gamepad, XR) write to it; consumers (character controller, camera) read
 * from it each frame via `useFrame`.
 *
 * This is intentionally a mutable singleton, not a Zustand store — input
 * is read every frame in the render loop, and we don't want React renders
 * on every keypress.
 *
 * See SPEC.md §2 row 7 for the full multi-device contract.
 */
import { Vector2 } from 'three'

export interface InputState {
  /** Movement intent on the camera-relative plane. -1..1 each axis, magnitude ≤ 1. */
  move: Vector2
  /** Look intent (camera rotation). -1..1 each axis. */
  look: Vector2
  /** Edge-triggered: true on the frame jump is requested; consumers reset to false. */
  jump: boolean
  /** Held: true while sprint key is down. */
  run: boolean
  /** Edge-triggered: true on the frame interact is requested; consumers reset to false. */
  interact: boolean
}

export const inputState: InputState = {
  move: new Vector2(),
  look: new Vector2(),
  jump: false,
  run: false,
  interact: false,
}
