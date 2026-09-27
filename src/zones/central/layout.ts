import { PAL } from '@/render/palette'
import type { ColliderSpec, InteractableSpec, PlaceSpec, Rect, Segment, WalkGraph } from '../types'

/**
 * Central Station, as data. The platform runs along x; the overlook railing
 * faces −z down the canal; the maglev runs past the screen doors at +z.
 * West bridge → Career District gate. East bridge → Vision Quest tower.
 */
export const PLATFORM: Rect = { x0: -34, x1: 34, z0: -6, z1: 5 }
export const SCREEN_DOOR_Z = 4.9
export const TRACK_Z = 8.6
export const GATE = { x: -76, z: -7 }
export const TOWER = { x: 70, z: -7 }

/** Walkable floor slabs (top at y = 0). */
export const FLOORS: Rect[] = [
  PLATFORM,
  { x0: -54, x1: -34, z0: -2.6, z1: 2.6 },
  { x0: 34, x1: 54, z0: -2.6, z1: 2.6 },
  { x0: -78, x1: -54, z0: -18, z1: 4 },
  { x0: 54, x1: 78, z0: -18, z1: 4 },
]

export interface Railing extends Segment {
  /** Colour of the thin light line at its base. */
  glow: string
}

const r = (x0: number, z0: number, x1: number, z1: number, glow: string = PAL.cyan): Railing => ({ x0, z0, x1, z1, glow })

export const RAILINGS: Railing[] = [
  // platform: overlook side and the two short ends
  r(-34, -6, 34, -6),
  r(-34, -6, -34, -2.6),
  r(34, -6, 34, -2.6),
  r(-34, 2.6, -34, 4.9),
  r(34, 2.6, 34, 4.9),
  // bridges
  r(-54, -2.6, -34, -2.6),
  r(-54, 2.6, -34, 2.6),
  r(34, -2.6, 54, -2.6),
  r(34, 2.6, 54, 2.6),
  // west plaza (career)
  r(-78, -18, -54, -18, PAL.yellow),
  r(-78, 4, -54, 4, PAL.yellow),
  r(-54, -18, -54, -2.6, PAL.yellow),
  r(-54, 2.6, -54, 4, PAL.yellow),
  r(-78, -18, -78, 4, PAL.yellow),
  // east plaza (vision quest)
  r(54, -18, 78, -18, PAL.mint),
  r(54, 4, 78, 4, PAL.mint),
  r(54, -18, 54, -2.6, PAL.mint),
  r(54, 2.6, 54, 4, PAL.mint),
  r(78, -18, 78, 4, PAL.mint),
]

/** Canopy pillars along both platform edges. */
export const PILLARS: [number, number][] = [-24, -12, 0, 12, 24].flatMap((x) => [
  [x, -5.4],
  [x, 4.4],
] as [number, number][])

export const BENCHES = [-20, -2, 8].map((x) => ({ x, z: -4.1 }))
export const ROUTE_MAP = { x: -8, z: -5.25 }
export const KIOSK = { x: 18, z: -5.1 }

/** Tap-to-walk graph: west plaza — west bridge — platform — east bridge — east plaza. */
export const WALK: WalkGraph = {
  regions: [
    { x0: -77, x1: -54.5, z0: -17.5, z1: 3.5 },
    { x0: -55, x1: -33.5, z0: -2.1, z1: 2.1 },
    { x0: -33.5, x1: 33.5, z0: -5.5, z1: 4.1 },
    { x0: 33.5, x1: 55, z0: -2.1, z1: 2.1 },
    { x0: 54.5, x1: 77, z0: -17.5, z1: 3.5 },
  ],
  junctions: [
    [-54.8, 0],
    [-33.6, 0],
    [33.6, 0],
    [54.8, 0],
  ],
}

export const INTERACTABLES: InteractableSpec[] = [
  { id: 'line', label: 'Read route map', at: [ROUTE_MAP.x, -4.2], radius: 2.4, panel: 'line' },
  { id: 'pass', label: 'Check transit pass', at: [KIOSK.x, -4.2], radius: 2.2, panel: 'pass' },
  { id: 'career', label: 'Enter Career District', at: [-70, -7], radius: 7, panel: 'career', stamp: 'career' },
  { id: 'visionquest', label: 'Enter Vision Quest Broadcast', at: [63, -7], radius: 8, panel: 'visionquest', stamp: 'visionquest' },
]

export const PLACES: PlaceSpec[] = [
  { id: 'central', name: 'Central Station', jp: '中央駅', sector: 'STATION 01 · CAREER DISTRICT', rim: PAL.cyan, spawn: [0, -1], look: [0, -40] },
  { id: 'career', name: 'Career District Gate', jp: 'キャリア', sector: 'STATION 01 · WEST GATE', rim: PAL.lime, spawn: [-64, -4], look: [-76, -7], pitch: -0.12 },
  { id: 'visionquest', name: 'Vision Quest Broadcast', jp: '放送局', sector: 'STATION 01 · EAST PLAZA', rim: PAL.mint, spawn: [57, -3], look: [70, -7], pitch: 0.02 },
]

export function placeAt(x: number) {
  return x < -50 ? 'career' : x > 50 ? 'visionquest' : 'central'
}

/** Keep the camera under the canopy roof while it is over the platform. */
export function cameraCeiling(x: number, z: number) {
  return Math.abs(x) < 27 && z > -6.7 && z < 5.7 ? 5.5 : Infinity
}

const WALL_H = 1.3

function wall(s: Segment): ColliderSpec {
  const dx = s.x1 - s.x0
  const dz = s.z1 - s.z0
  const len = Math.hypot(dx, dz)
  return { kind: 'box', center: [(s.x0 + s.x1) / 2, WALL_H / 2, (s.z0 + s.z1) / 2], half: [len / 2 + 0.05, WALL_H / 2, 0.1], rotY: -Math.atan2(dz, dx) }
}

/** Every physics collider in the station, derived from the data above. */
export function colliders(): ColliderSpec[] {
  const out: ColliderSpec[] = []
  for (const f of FLOORS) out.push({ kind: 'box', center: [(f.x0 + f.x1) / 2, -0.5, (f.z0 + f.z1) / 2], half: [(f.x1 - f.x0) / 2, 0.5, (f.z1 - f.z0) / 2] })
  for (const s of RAILINGS) out.push(wall(s))
  out.push(wall({ x0: PLATFORM.x0, z0: SCREEN_DOOR_Z, x1: PLATFORM.x1, z1: SCREEN_DOOR_Z }))
  for (const [x, z] of PILLARS) out.push({ kind: 'cylinder', center: [x, 1.5, z], radius: 0.4, halfHeight: 1.5 })
  for (const b of BENCHES) out.push({ kind: 'box', center: [b.x, 0.45, b.z + 0.1], half: [1.25, 0.45, 0.4] })
  out.push({ kind: 'box', center: [ROUTE_MAP.x, 1.2, ROUTE_MAP.z], half: [1.9, 1.2, 0.2] })
  out.push({ kind: 'box', center: [KIOSK.x, 1.05, KIOSK.z], half: [0.7, 1.05, 0.45] })
  for (const dz of [-5, 5]) out.push({ kind: 'box', center: [GATE.x, 5, GATE.z + dz], half: [0.8, 5, 0.8] })
  out.push({ kind: 'cylinder', center: [TOWER.x, 3, TOWER.z], radius: 4.4, halfHeight: 3 })
  return out
}
