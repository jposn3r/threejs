import { centralZone } from './central'
import type { ZoneDef } from './types'

/**
 * Every station on the Metakaizen Line that has a built zone. Adding a zone
 * means adding a folder under src/zones and a line here (SPEC §4).
 */
export const zones: Record<string, ZoneDef> = {
  central: centralZone,
}

export const DEFAULT_ZONE = 'central'
