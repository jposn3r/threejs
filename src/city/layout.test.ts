import { describe, expect, it } from 'vitest'
import { building, createCityContext } from './building'
import { CANAL, GROUND_Y, TRACK_Z, layoutCanalCity } from './layout'

describe('building', () => {
  it('is deterministic for a seed', () => {
    const a = createCityContext(GROUND_Y)
    const b = createCityContext(GROUND_Y)
    building(a, 10, -100, 20, 20, 80, 7, [-1, 0])
    building(b, 10, -100, 20, 20, 80, 7, [-1, 0])
    expect(a.kit.count()).toBe(b.kit.count())
    expect(a.beacons).toEqual(b.beacons)
    expect(a.signs).toEqual(b.signs)
  })

  it('tags every facade part with its seed', () => {
    const ctx = createCityContext(GROUND_Y)
    building(ctx, 0, -100, 20, 20, 80, 42, [0, 1])
    for (const g of ctx.kit.bins.facade) {
      const seeds = new Set(g.getAttribute('aSeed').array as Float32Array)
      expect([...seeds]).toEqual([42])
    }
  })

  it('stands on the ground and ends near its requested height', () => {
    for (let seed = 1; seed < 40; seed++) {
      const ctx = createCityContext(GROUND_Y)
      const top = building(ctx, 0, -100, 20, 20, 80, seed, [1, 0])
      // the last tier may be skipped if less than 8 m would remain
      expect(top).toBeLessThanOrEqual(GROUND_Y + 80 + 1e-6)
      expect(top).toBeGreaterThan(GROUND_Y + 80 - 8)
    }
  })
})

describe('layoutCanalCity', () => {
  const layout = layoutCanalCity()

  it('is deterministic', () => {
    const again = layoutCanalCity()
    expect(again.ctx.lots).toEqual(layout.ctx.lots)
    expect(again.farTowers.length).toBe(layout.farTowers.length)
  })

  it('keeps the canal open', () => {
    for (const l of layout.ctx.lots) {
      if (l.z < CANAL.z0 && l.z > CANAL.z1) expect(Math.abs(l.x) - l.w / 2).toBeGreaterThan(CANAL.half)
    }
  })

  it('never builds across the maglev', () => {
    for (const l of layout.ctx.lots) expect(Math.abs(l.z - TRACK_Z) - l.d / 2).toBeGreaterThan(0)
    for (const t of layout.farTowers) expect(Math.abs(t.z - TRACK_Z)).toBeGreaterThanOrEqual(18)
  })

  it('merges into exactly three draw calls', () => {
    const merged = layoutCanalCity().ctx.kit.merge()
    expect(merged.facade).not.toBeNull()
    expect(merged.trim).not.toBeNull()
    expect(merged.glow).not.toBeNull()
    expect(merged.facade!.getAttribute('aSeed')).toBeDefined()
    expect(merged.glow!.getAttribute('color')).toBeDefined()
  })

  it('has a skyline of reasonable size', () => {
    expect(layout.ctx.lots.length).toBeGreaterThan(150)
    expect(layout.farTowers.length).toBeGreaterThan(300)
    expect(layout.ctx.signs.length).toBeGreaterThan(20)
  })
})
