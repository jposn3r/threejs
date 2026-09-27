import type * as THREE from 'three'

/** Axis-aligned rectangle on the ground plane. */
export interface Rect {
  x0: number
  x1: number
  z0: number
  z1: number
}

/** A straight wall/railing on the ground plane, from (x0,z0) to (x1,z1). */
export interface Segment {
  x0: number
  z0: number
  x1: number
  z1: number
}

/**
 * Where tap-to-walk may go. Regions form a chain; junctions[i] is the
 * doorway between regions[i] and regions[i + 1].
 */
export interface WalkGraph {
  regions: Rect[]
  junctions: [number, number][]
}

export type ColliderSpec =
  | { kind: 'box'; center: [number, number, number]; half: [number, number, number]; rotY?: number }
  | { kind: 'cylinder'; center: [number, number, number]; radius: number; halfHeight: number }

export interface InteractableSpec {
  id: string
  /** Prompt text, e.g. "Enter Career District". */
  label: string
  at: [number, number]
  radius: number
  /** Panel to open. */
  panel: string
  /** Transit-pass stamp awarded when opened. */
  stamp?: string
}

export interface PlaceSpec {
  id: string
  name: string
  jp: string
  sector: string
  /** Rim-light colour for characters standing here. */
  rim: string
  spawn: [number, number]
  /** Point the camera looks toward on spawn. */
  look: [number, number]
  /** Camera pitch on spawn (negative = low, looking up). Default 0.16. */
  pitch?: number
}

/** A built zone, ready to mount. */
export interface ZoneInstance {
  group: THREE.Group
  /** Meshes that open an interactable when tapped. */
  hitTargets: { object: THREE.Object3D; id: string }[]
  /** Walkable surfaces for tap-to-walk raycasts. */
  floors: THREE.Object3D[]
  sky: THREE.Object3D
  fog: THREE.FogExp2
  update(t: number, dt: number, focus: THREE.Vector3): void
  setQuality(high: boolean): void
  setSize(w: number, h: number, dpr: number): void
  dispose(): void
}

export interface ZoneDef {
  id: string
  walk: WalkGraph
  colliders: ColliderSpec[]
  interactables: InteractableSpec[]
  places: PlaceSpec[]
  defaultPlace: string
  /** Which place the traveler is in, for the HUD and rim colour. */
  placeAt(x: number, z: number): string
  /** Highest the camera may go at (x, z) — keeps it under roofs. */
  cameraCeiling(x: number, z: number): number
  build(): ZoneInstance
}
