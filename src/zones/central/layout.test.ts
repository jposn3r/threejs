import { describe, expect, it } from 'vitest'
import { regionOf } from '@/interaction/route'
import { FLOORS, INTERACTABLES, PLACES, WALK, colliders, placeAt } from './layout'

describe('Central Station layout', () => {
  it('spawns every place on the walkway', () => {
    for (const p of PLACES) expect(regionOf(WALK, p.spawn[0], p.spawn[1]), p.id).toBeGreaterThanOrEqual(0)
  })

  it('puts every interactable where you can stand', () => {
    for (const i of INTERACTABLES) expect(regionOf(WALK, i.at[0], i.at[1]), i.id).toBeGreaterThanOrEqual(0)
  })

  it('has walk regions only on floor slabs', () => {
    for (const r of WALK.regions) {
      const inside = (x: number, z: number) => FLOORS.some((f) => x >= f.x0 && x <= f.x1 && z >= f.z0 && z <= f.z1)
      expect(inside(r.x0, r.z0) && inside(r.x1, r.z1)).toBe(true)
    }
  })

  it('links each pair of neighbouring regions with a junction on both', () => {
    WALK.junctions.forEach(([x, z], i) => {
      const a = WALK.regions[i]
      const b = WALK.regions[i + 1]
      const near = (r: typeof a) => x >= r.x0 - 1 && x <= r.x1 + 1 && z >= r.z0 && z <= r.z1
      expect(near(a) && near(b)).toBe(true)
    })
  })

  it('lets you use a gate right where its place spawns you', () => {
    for (const p of PLACES) {
      const gate = INTERACTABLES.find((i) => i.id === p.id)
      if (gate) expect(Math.hypot(p.spawn[0] - gate.at[0], p.spawn[1] - gate.at[1]), p.id).toBeLessThan(gate.radius)
    }
  })

  it('places each spawn in its own place', () => {
    for (const p of PLACES) expect(placeAt(p.spawn[0])).toBe(p.id)
  })

  it('builds colliders with sane sizes', () => {
    const list = colliders()
    expect(list.length).toBeGreaterThan(20)
    for (const c of list) {
      if (c.kind === 'box') c.half.forEach((h) => expect(h).toBeGreaterThan(0))
      else expect(c.radius).toBeGreaterThan(0)
    }
  })
})
