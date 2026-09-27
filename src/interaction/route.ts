import type { WalkGraph } from '@/zones/types'

export interface Point {
  x: number
  z: number
}

/** Index of the walk region containing (x, z), or −1. */
export function regionOf(graph: WalkGraph, x: number, z: number) {
  return graph.regions.findIndex((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1)
}

/**
 * Waypoints from `from` to `to` through the chain of regions. Each junction
 * is passed slightly inside the next region so the walker never grazes a
 * railing corner. Returns [] when either end is outside the walkable area.
 */
export function planRoute(graph: WalkGraph, from: Point, to: Point, inset = 0.8): Point[] {
  const a = regionOf(graph, from.x, from.z)
  const b = regionOf(graph, to.x, to.z)
  if (a < 0 || b < 0) return []
  const pts: Point[] = []
  if (a < b) for (let i = a; i < b; i++) pts.push({ x: graph.junctions[i][0] + inset, z: graph.junctions[i][1] })
  if (a > b) for (let i = a - 1; i >= b; i--) pts.push({ x: graph.junctions[i][0] - inset, z: graph.junctions[i][1] })
  pts.push({ x: to.x, z: to.z })
  return pts
}
