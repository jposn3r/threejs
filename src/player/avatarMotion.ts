/**
 * Procedural walk / run / idle for a VRM normalized humanoid rig.
 *
 * Pure: advances a small state and returns joint angles; the avatar
 * component applies them to bones. Conventions for VRM 1.0 (model faces +Z):
 *  - upper leg rotation.x < 0 swings the leg forward
 *  - lower leg rotation.x > 0 bends the knee
 *  - upper arm rotation.z −1.2 (left) / +1.2 (right) lowers arms from T-pose;
 *    rotation.x then swings them forward/back
 */
export interface MotionState {
  phase: number
  /** Smoothed gait amplitude, 0 = idle. */
  amp: number
  /** Seconds until the next blink. */
  blinkIn: number
}

export interface Pose {
  leftUpperLegX: number
  rightUpperLegX: number
  leftLowerLegX: number
  rightLowerLegX: number
  leftUpperArm: [number, number, number]
  rightUpperArm: [number, number, number]
  leftLowerArmY: number
  rightLowerArmY: number
  spineY: number
  chestX: number
  headX: number
  /** Vertical body offset (m). */
  bob: number
  /** Blink weight 0..1. */
  blink: number
}

export const ARM_DOWN = 1.2

export function createMotion(): MotionState {
  return { phase: 0, amp: 0, blinkIn: 2 }
}

export function stepMotion(s: MotionState, dt: number, moving: boolean, running: boolean, t: number, random = Math.random): Pose {
  const target = moving ? (running ? 1 : 0.7) : 0
  s.amp += (target - s.amp) * (1 - Math.exp(-10 * dt))
  if (moving) s.phase += dt * (running ? 10.5 : 7.4)
  const sw = Math.sin(s.phase)
  const breathe = Math.sin(t * 1.7) * 0.02

  s.blinkIn -= dt
  const blink = s.blinkIn < 0.12 && s.blinkIn > 0 ? Math.sin((s.blinkIn / 0.12) * Math.PI) : 0
  if (s.blinkIn <= 0) s.blinkIn = 2.5 + random() * 3

  const a = s.amp
  return {
    leftUpperLegX: -sw * 0.6 * a,
    rightUpperLegX: sw * 0.6 * a,
    leftLowerLegX: Math.max(0, sw) * a,
    rightLowerLegX: Math.max(0, -sw) * a,
    leftUpperArm: [sw * 0.55 * a, 0, -ARM_DOWN + breathe],
    rightUpperArm: [-sw * 0.55 * a, 0, ARM_DOWN - breathe],
    leftLowerArmY: -(0.2 + 0.35 * a),
    rightLowerArmY: 0.2 + 0.35 * a,
    spineY: sw * 0.1 * a,
    chestX: (running ? 0.14 : 0.05) * a + breathe,
    headX: -0.04 * a,
    bob: -Math.abs(Math.cos(s.phase)) * 0.05 * a,
    blink,
  }
}
