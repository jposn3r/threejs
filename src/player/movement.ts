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
 *  - the floor clamp on next translation (the controller does this AFTER
 *    asking us — we just compute the intent here)
 *
 * Tuning constants live in this file so the tests can import them too.
 */

export const WALK_SPEED = 4 // m/s
export const RUN_SPEED = 7 // m/s
export const JUMP_VELOCITY = 6 // m/s upward impulse
export const GRAVITY = -25 // m/s² (slightly stronger than real for "game feel")
export const MAX_DT = 0.1 // cap delta to avoid tunneling on big frame drops

export interface MovementIntent {
  /** Horizontal intent on camera-relative XZ. -1..1 each axis, magnitude ≤ 1. */
  moveX: number
  moveY: number
  /** Edge-triggered: true if jump was requested this frame. Consumed if applied. */
  jump: boolean
  /** Held: true if sprint key is down. */
  run: boolean
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
 * Compute one frame of character movement.
 *
 * @param intent  current input
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

  // Horizontal — world-relative for now (camera-relative comes with mouse-look in M4)
  const dx = intent.moveX * speed * dt
  const dz = intent.moveY * speed * dt

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
