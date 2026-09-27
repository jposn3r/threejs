import type { ZoneDef, ZoneInstance } from './types'

/**
 * The zone currently mounted. Set by <ZoneMount />; read in per-frame code
 * (tap routing) that needs the built meshes without subscribing to React.
 */
export const world: { def: ZoneDef | null; instance: ZoneInstance | null } = {
  def: null,
  instance: null,
}
