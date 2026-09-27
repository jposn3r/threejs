import { describe, expect, it } from 'vitest'
import { WALK } from '@/zones/central/layout'
import { planRoute, regionOf } from './route'

describe('regionOf', () => {
  it('finds the platform, bridges and plazas', () => {
    expect(regionOf(WALK, 0, 0)).toBe(2)
    expect(regionOf(WALK, -44, 0)).toBe(1)
    expect(regionOf(WALK, 44, 0)).toBe(3)
    expect(regionOf(WALK, -70, -7)).toBe(0)
    expect(regionOf(WALK, 70, -12)).toBe(4)
  })

  it('rejects points off the walkway', () => {
    expect(regionOf(WALK, 0, -20)).toBe(-1) // over the canal
    expect(regionOf(WALK, -44, -6)).toBe(-1) // beside a bridge
  })
})

describe('planRoute', () => {
  it('walks straight within one region', () => {
    expect(planRoute(WALK, { x: 0, z: 0 }, { x: 10, z: -3 })).toEqual([{ x: 10, z: -3 }])
  })

  it('routes platform → east plaza through both east junctions', () => {
    const route = planRoute(WALK, { x: 0, z: -4 }, { x: 63, z: -7 })
    expect(route.map((p) => p.x)).toEqual([33.6 + 0.8, 54.8 + 0.8, 63])
    expect(route.at(-1)).toEqual({ x: 63, z: -7 })
  })

  it('routes east plaza → west plaza through every junction in reverse', () => {
    const route = planRoute(WALK, { x: 70, z: -7 }, { x: -70, z: -7 })
    expect(route.map((p) => p.x)).toEqual([54.8 - 0.8, 33.6 - 0.8, -33.6 - 0.8, -54.8 - 0.8, -70])
  })

  it('every waypoint lies on the walkway', () => {
    const route = planRoute(WALK, { x: 70, z: -7 }, { x: -70, z: -7 })
    for (const p of route) expect(regionOf(WALK, p.x, p.z)).toBeGreaterThanOrEqual(0)
  })

  it('returns nothing when the target is off the walkway', () => {
    expect(planRoute(WALK, { x: 0, z: 0 }, { x: 0, z: -30 })).toEqual([])
  })
})
