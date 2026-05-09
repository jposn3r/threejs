import { describe, it, expect } from 'vitest'
import {
  cameraRelativeMovement,
  computeMovement,
  WALK_SPEED,
  RUN_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
} from './movement'

const dt = 1 / 60

const noIntent = {
  moveX: 0,
  moveY: 0,
  jump: false,
  run: false,
  cameraYaw: 0,
}
const zeroState = { verticalVelocity: 0 }

// ─── cameraRelativeMovement ─────────────────────────────────────────────

describe('cameraRelativeMovement — yaw=0 (default camera behind player)', () => {
  it('W (moveY=-1) goes to world -Z', () => {
    const r = cameraRelativeMovement(0, -1, 0)
    expect(r.x).toBeCloseTo(0)
    expect(r.z).toBeCloseTo(-1)
  })

  it('S (moveY=+1) goes to world +Z', () => {
    const r = cameraRelativeMovement(0, 1, 0)
    expect(r.x).toBeCloseTo(0)
    expect(r.z).toBeCloseTo(1)
  })

  it('D (moveX=+1) goes to world +X', () => {
    const r = cameraRelativeMovement(1, 0, 0)
    expect(r.x).toBeCloseTo(1)
    expect(r.z).toBeCloseTo(0)
  })

  it('A (moveX=-1) goes to world -X', () => {
    const r = cameraRelativeMovement(-1, 0, 0)
    expect(r.x).toBeCloseTo(-1)
    expect(r.z).toBeCloseTo(0)
  })
})

describe('cameraRelativeMovement — yaw=-π/2 (camera orbited so view points +X)', () => {
  // Mouse-right makes yaw decrease; -π/2 means user is looking toward +X.
  const yaw = -Math.PI / 2

  it('W now sends the player toward world +X', () => {
    const r = cameraRelativeMovement(0, -1, yaw)
    expect(r.x).toBeCloseTo(1)
    expect(r.z).toBeCloseTo(0)
  })

  it('D now sends the player toward world +Z', () => {
    const r = cameraRelativeMovement(1, 0, yaw)
    expect(r.x).toBeCloseTo(0)
    expect(r.z).toBeCloseTo(1)
  })
})

describe('cameraRelativeMovement — yaw=π (looking the opposite direction)', () => {
  it('W now sends the player toward world +Z', () => {
    const r = cameraRelativeMovement(0, -1, Math.PI)
    expect(r.x).toBeCloseTo(0)
    expect(r.z).toBeCloseTo(1)
  })
})

describe('cameraRelativeMovement — magnitude invariance', () => {
  it('rotation does not change vector magnitude', () => {
    for (const yaw of [0, 0.5, 1, -1, Math.PI / 2, Math.PI, -Math.PI]) {
      const r = cameraRelativeMovement(1, 0, yaw)
      const mag = Math.sqrt(r.x * r.x + r.z * r.z)
      expect(mag).toBeCloseTo(1)
    }
  })

  it('pre-normalized diagonal stays unit length under rotation', () => {
    const v = 1 / Math.sqrt(2)
    const r = cameraRelativeMovement(v, -v, Math.PI / 4)
    const mag = Math.sqrt(r.x * r.x + r.z * r.z)
    expect(mag).toBeCloseTo(1)
  })
})

// ─── computeMovement — horizontal ────────────────────────────────────────

describe('computeMovement — horizontal (yaw=0)', () => {
  it('produces no movement when no input and grounded', () => {
    const r = computeMovement(noIntent, zeroState, true, dt)
    expect(r.dx).toBe(0)
    expect(r.dz).toBe(0)
    expect(r.dy).toBe(0)
  })

  it('walks forward at WALK_SPEED when moveY is -1 (W)', () => {
    const r = computeMovement({ ...noIntent, moveY: -1 }, zeroState, true, dt)
    expect(r.dz).toBeCloseTo(-WALK_SPEED * dt)
    expect(r.dx).toBeCloseTo(0)
  })

  it('walks right at WALK_SPEED when moveX is 1 (D)', () => {
    const r = computeMovement({ ...noIntent, moveX: 1 }, zeroState, true, dt)
    expect(r.dx).toBeCloseTo(WALK_SPEED * dt)
    expect(r.dz).toBeCloseTo(0)
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

describe('computeMovement — horizontal (camera-relative)', () => {
  it('W with yaw=-π/2 sends the player to +X at WALK_SPEED', () => {
    const r = computeMovement(
      { ...noIntent, moveY: -1, cameraYaw: -Math.PI / 2 },
      zeroState,
      true,
      dt,
    )
    expect(r.dx).toBeCloseTo(WALK_SPEED * dt)
    expect(r.dz).toBeCloseTo(0)
  })

  it('rotating yaw does not change movement magnitude', () => {
    for (const yaw of [0, 0.5, 1, Math.PI / 2, -Math.PI]) {
      const r = computeMovement(
        { ...noIntent, moveY: -1, cameraYaw: yaw },
        zeroState,
        true,
        dt,
      )
      const speed = Math.sqrt(r.dx ** 2 + r.dz ** 2)
      expect(speed).toBeCloseTo(WALK_SPEED * dt)
    }
  })
})

// ─── computeMovement — jump ──────────────────────────────────────────────

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
    expect(r.verticalVelocity).toBeCloseTo(5 + GRAVITY * dt)
  })

  it('jumps the same height regardless of horizontal speed', () => {
    const slow = computeMovement(
      { ...noIntent, moveY: -1, jump: true, run: false },
      zeroState,
      true,
      dt,
    )
    const fast = computeMovement(
      { ...noIntent, moveY: -1, jump: true, run: true },
      zeroState,
      true,
      dt,
    )
    expect(fast.verticalVelocity).toBe(slow.verticalVelocity)
    expect(fast.dy).toBe(slow.dy)
  })

  it('horizontal sprint then walk transition does not affect vertical', () => {
    const sprint = computeMovement(
      { ...noIntent, moveY: -1, run: true },
      zeroState,
      true,
      dt,
    )
    const walk = computeMovement(
      { ...noIntent, moveY: -1, run: false },
      { verticalVelocity: sprint.verticalVelocity },
      true,
      dt,
    )
    expect(walk.verticalVelocity).toBe(0)
    expect(walk.dy).toBe(0)
  })
})

// ─── computeMovement — gravity ───────────────────────────────────────────

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
    const falling = { verticalVelocity: -50 }
    const r = computeMovement(noIntent, falling, true, dt)
    expect(r.verticalVelocity).toBe(0)
    expect(r.dy).toBe(0)
  })

  it('full jump arc: jump → ascend → peak → descend → land', () => {
    let state = { verticalVelocity: 0 }
    let y = 0.9
    let frames = 0
    let peakY = y
    let peakedAt = -1
    let landed = false

    const initial = computeMovement(
      { ...noIntent, jump: true },
      state,
      true,
      dt,
    )
    state = { verticalVelocity: initial.verticalVelocity }
    y += initial.dy
    expect(initial.jumpConsumed).toBe(true)

    while (frames < 1000 && !landed) {
      const grounded = y <= 0.9
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
    expect(peakY).toBeGreaterThan(1.5)
    expect(peakedAt).toBeGreaterThan(0)
    expect(peakedAt).toBeLessThan(frames)
  })
})
