import { describe, expect, it } from 'vitest'
import { ARM_DOWN, createMotion, stepMotion } from './avatarMotion'

const frames = (n: number, moving: boolean, running = false) => {
  const s = createMotion()
  let pose = stepMotion(s, 1 / 60, moving, running, 0, () => 0.5)
  for (let i = 1; i < n; i++) pose = stepMotion(s, 1 / 60, moving, running, i / 60, () => 0.5)
  return { s, pose }
}

describe('stepMotion', () => {
  it('idles with arms down and legs straight', () => {
    const { pose } = frames(120, false)
    expect(pose.leftUpperLegX).toBeCloseTo(0)
    expect(pose.rightUpperLegX).toBeCloseTo(0)
    expect(Math.abs(pose.leftUpperArm[2] + ARM_DOWN)).toBeLessThan(0.03)
    expect(Math.abs(pose.rightUpperArm[2] - ARM_DOWN)).toBeLessThan(0.03)
  })

  it('swings legs in opposition while walking', () => {
    const { pose } = frames(40, true)
    expect(pose.leftUpperLegX).toBeCloseTo(-pose.rightUpperLegX)
    expect(Math.abs(pose.leftUpperLegX)).toBeGreaterThan(0.05)
  })

  it('swings each arm opposite its leg', () => {
    const { pose } = frames(40, true)
    expect(Math.sign(pose.leftUpperArm[0])).toBe(-Math.sign(pose.leftUpperLegX))
  })

  it('bends only the trailing knee, never backwards', () => {
    for (let n = 10; n < 80; n += 7) {
      const { pose } = frames(n, true)
      expect(pose.leftLowerLegX).toBeGreaterThanOrEqual(0)
      expect(pose.rightLowerLegX).toBeGreaterThanOrEqual(0)
      expect(pose.leftLowerLegX * pose.rightLowerLegX).toBe(0)
    }
  })

  it('runs with a bigger stride than it walks', () => {
    expect(frames(120, true, true).s.amp).toBeGreaterThan(frames(120, true, false).s.amp)
  })
})
