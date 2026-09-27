import type { ComponentType } from 'react'
import { centralPanels } from '@/zones/central/panels'

/** Panel components per zone, looked up by the open panel id. */
export const panelsByZone: Record<string, Record<string, ComponentType>> = {
  central: centralPanels,
}
