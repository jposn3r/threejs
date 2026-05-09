/**
 * Pure character-movement logic, extracted from CharacterController so it
 * can be tested deterministically without Rapier or React.
 *
 * Input: current state + intent + dt
 * Output: next state + the per-axis movement to apply this frame
 *
 * The character controller component handles wiring this to:
 *  - the kinematic RigidBody's translation (apply movement)
 *  - the keyboard producer's inputState (intent)
 *  - the mouse producer's cameraState (yaw)
 *  - the floor clamp on next translation
 *
 * Tuning constants live in this file so the tests can import them too.
 */

export const WALK_SPEED = 4 // m/s
export const RUN_SPEED = 7 // m/s
export const JUMP_VELOCITY = 6 // m/s upward impulse
export const GRAVITY = -25 // m/s² (slightly stronger than real for "game feel")
export const MAX_DT = 0.1 // cap delta to avoid tunneling on big frame drops

export interface MovementIntent {
  /** Horizontal intent. moveY = -1 is forward (W). magnitude ≤ 1. */
  moveX: number
  moveY: number
  /** Edge-triggered: true if jump was requested this frame. Consumed if applied. */
  jump: boolean
  /** Held: true if sprint key is down. */
  run: boolean
  /** Camera horizontal angle in radians. Movement is rotated by this so W
   * always means "where the camera is looking." See cameraState.ts. */
  cameraYaw: number
}

export interface MovementState {
  /** Vertical velocity carried frame-to-frame (m/s). */
  verticalVelocity: number
}

export interface MovementResult {
  /** Per-frame translation delta to apply (meters). */
  dx: number
  dy: number
  dz: number
  /** New vertical velocity to carry forward. */
  verticalVelocity: number
  /** True if the jump intent was consumed (controller should clear inputState.jump). */
  jumpConsumed: boolean
}

/**
 * Rotate input intent (which is camera-relative: moveY=-1 means "forward in
 * the view," moveX=+1 means "right of the view") into world-space XZ.
 *
 * Math derivation lives in chat history; condensed:
 *   forward = (-sin(yaw), -cos(yaw))     ← world dir for moveY = -1 (W)
 *   right   = ( cos(yaw), -sin(yaw))     ← world dir for moveX = +1 (D)
 *
 * Returns world-space horizontal displacement direction with the same
 * magnitude as the input intent vector (no speed applied yet).
 */
export function cameraRelativeMovement(
  moveX: number,
  moveY: number,
  yaw: number,
): { x: number; z: number } {
  const sinY = Math.sin(yaw)
  const cosY = Math.cos(yaw)

  const forwardX = -sinY
  const forwardZ = -cosY
  const rightX = cosY
  const rightZ = -sinY

  // moveY=-1 (W) → +1 forward; moveX=+1 (D) → +1 right
  const x = moveX * rightX + -moveY * forwardX
  const z = moveX * rightZ + -moveY * forwardZ

  return { x, z }
}

/**
 * Compute one frame of character movement.
 *
 * @param intent  current input (includes camera yaw for relative movement)
 * @param state   carried state (vertical velocity)
 * @param grounded  whether the character is currently on the ground
 * @param dt  frame delta in seconds (already capped by caller if desired)
 */
export function computeMovement(
  intent: MovementIntent,
  state: MovementState,
  grounded: boolean,
  dt: number,
): MovementResult {
  const speed = intent.run ? RUN_SPEED : WALK_SPEED

  // Horizontal — rotate input by camera yaw before applying speed
  const cam = cameraRelativeMovement(intent.moveX, intent.moveY, intent.cameraYaw)
  const dx = cam.x * speed * dt
  const dz = cam.z * speed * dt

  // Vertical — gravity + jump
  let vy = state.verticalVelocity
  let jumpConsumed = false

  if (grounded) {
    vy = 0
    if (intent.jump) {
      vy = JUMP_VELOCITY
      jumpConsumed = true
    }
  } else {
    vy = vy + GRAVITY * dt
  }

  const dy = vy * dt

  return {
    dx,
    dy,
    dz,
    verticalVelocity: vy,
    jumpConsumed,
  }
}
