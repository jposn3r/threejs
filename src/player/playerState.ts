import { Vector3 } from 'three'
import type { Point } from '@/interaction/route'

/**
 * Per-frame traveler state shared by the controller, camera, avatar,
 * proximity checks and tap routing. Mutable singleton (same pattern as
 * inputState) — read and written inside useFrame, never via React state.
 */
export const playerState = {
  /** Feet position in world space. */
  position: new Vector3(),
  /** Heading in radians; 0 faces +Z. */
  facing: Math.PI,
  /** Current ground speed (m/s) and whether that's a run — drives animation. */
  speed: 0,
  running: false,
  /** Tap-to-walk waypoints, consumed front to back. */
  route: [] as Point[],
  /** Panel to open when the route finishes (tapped a landmark). */
  pendingOpen: null as string | null,
  /** performance.now() of the last manual camera drag; auto-follow waits for it. */
  lastLook: 0,
  /** Teleport request (spawn, fast travel, deep link). Consumed by the controller. */
  teleport: null as { x: number; z: number } | null,
}

export function clearRoute() {
  playerState.route = []
  playerState.pendingOpen = null
}
