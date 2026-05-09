import { describe, it, expect } from 'vitest'
import {
  computeMovement,
  WALK_SPEED,
  RUN_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
} from './movement'

const dt = 1 / 60 // 60fps frame

const noIntent = { moveX: 0, moveY: 0, jump: false, run: false }
const zeroState = { verticalVelocity: 0 }

describe('computeMovement — horizontal', () => {
  it('produces no movement when no input and grounded', () => {
    const r = computeMovement(noIntent, zeroState, true, dt)
    expect(r.dx).toBe(0)
    expect(r.dz).toBe(0)
    expect(r.dy).toBe(0)
  })

  it('walks forward at WALK_SPEED when moveY is -1 (W)', () => {
    const r = computeMovement(
      { ...noIntent, moveY: -1 },
      zeroState,
      true,
      dt,
    )
    expect(r.dz).toBeCloseTo(-WALK_SPEED * dt)
    expect(r.dx).toBe(0)
  })

  it('walks right at WALK_SPEED when moveX is 1 (D)', () => {
    const r = computeMovement(
      { ...noIntent, moveX: 1 },
      zeroState,
      true,
      dt,
    )
    expect(r.dx).toBeCloseTo(WALK_SPEED * dt)
    expect(r.dz).toBe(0)
  })

  it('sprints at RUN_SPEED when run is held', () => {
    const r = computeMovement(
      { ...noIntent, moveY: -1, run: true },
      zeroState,
      true,
      dt,
    )
    expect(r.dz).toBeCloseTo(-RUN_SPEED * dt)
  })

  it('respects pre-normalized diagonal input (no √2 boost)', () => {
    // Caller is responsible for normalizing; we should NOT re-normalize.
    // Pre-normalized diagonal: (1/√2, 1/√2) → magnitude 1
    const v = 1 / Math.sqrt(2)
    const r = computeMovement(
      { ...noIntent, moveX: v, moveY: v },
      zeroState,
      true,
      dt,
    )
    const speed = Math.sqrt(r.dx ** 2 + r.dz ** 2)
    expect(speed).toBeCloseTo(WALK_SPEED * dt)
  })
})

describe('computeMovement — jump', () => {
  it('triggers jump when grounded and jump intent is set', () => {
    const r = computeMovement(
      { ...noIntent, jump: true },
      zeroState,
      true,
      dt,
    )
    expect(r.verticalVelocity).toBe(JUMP_VELOCITY)
    expect(r.jumpConsumed).toBe(true)
    expect(r.dy).toBeCloseTo(JUMP_VELOCITY * dt)
  })

  it('does NOT jump when ungrounded (jump intent stays unconsumed)', () => {
    const r = computeMovement(
      { ...noIntent, jump: true },
      { verticalVelocity: 5 },
      false,
      dt,
    )
    expect(r.jumpConsumed).toBe(false)
    // Still subject to gravity
    expect(r.verticalVelocity).toBeCloseTo(5 + GRAVITY * dt)
  })

  it('jumps the same height regardless of horizontal speed', () => {
    const slow = computeMovement(
      { moveX: 0, moveY: -1, jump: true, run: false },
      zeroState,
      true,
      dt,
    )
    const fast = computeMovement(
      { moveX: 0, moveY: -1, jump: true, run: true },
      zeroState,
      true,
      dt,
    )
    expect(fast.verticalVelocity).toBe(slow.verticalVelocity)
    expect(fast.dy).toBe(slow.dy)
  })

  it('horizontal sprint then walk transition does not affect vertical', () => {
    // Mid-sprint while grounded
    const sprint = computeMovement(
      { moveX: 0, moveY: -1, jump: false, run: true },
      zeroState,
      true,
      dt,
    )
    // Same frame, intent flips to walk (shift released)
    const walk = computeMovement(
      { moveX: 0, moveY: -1, jump: false, run: false },
      { verticalVelocity: sprint.verticalVelocity },
      true,
      dt,
    )
    // Vertical velocity must remain 0 — the regression we're guarding against
    expect(walk.verticalVelocity).toBe(0)
    expect(walk.dy).toBe(0)
  })
})

describe('computeMovement — gravity', () => {
  it('accumulates downward velocity over time when ungrounded', () => {
    let state = { verticalVelocity: 0 }
    for (let i = 0; i < 10; i++) {
      const r = computeMovement(noIntent, state, false, dt)
      state = { verticalVelocity: r.verticalVelocity }
    }
    expect(state.verticalVelocity).toBeCloseTo(GRAVITY * dt * 10)
  })

  it('resets vertical velocity to 0 the moment we touch ground', () => {
    const falling = { verticalVelocity: -50 } // already falling fast
    const r = computeMovement(noIntent, falling, true, dt)
    expect(r.verticalVelocity).toBe(0)
    expect(r.dy).toBe(0)
  })

  it('full jump arc: jump → ascend → peak → descend → land', () => {
    let state = { verticalVelocity: 0 }
    let y = 0.9 // resting height
    let frames = 0
    let peakY = y
    let peakedAt = -1
    let landed = false

    // Frame 0: jump
    const initial = computeMovement(
      { ...noIntent, jump: true },
      state,
      true,
      dt,
    )
    state = { verticalVelocity: initial.verticalVelocity }
    y += initial.dy
    expect(initial.jumpConsumed).toBe(true)

    // Subsequent frames: ungrounded until y returns to ~0.9
    while (frames < 1000 && !landed) {
      const grounded = y <= 0.9 // floor-clamp emulation
      const r = computeMovement(noIntent, state, grounded, dt)
      state = { verticalVelocity: r.verticalVelocity }
      y += r.dy
      if (y > peakY) {
        peakY = y
        peakedAt = frames
      }
      if (frames > 5 && grounded) landed = true
      frames++
    }

    expect(landed).toBe(true)
    expect(peakY).toBeGreaterThan(1.5) // jumped meaningfully
    expect(peakedAt).toBeGreaterThan(0)
    expect(peakedAt).toBeLessThan(frames) // peak before landing
  })
})
