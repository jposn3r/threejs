import { inputState } from '@/input/InputState'
import { clearRoute } from '@/player/playerState'
import type { ZoneDef } from '@/zones/types'
import { useInteraction, usePass } from './store'

/** Open an interactable's panel, stamping the transit pass if it awards one. */
export function openInteractable(zone: ZoneDef, id: string) {
  const spec = zone.interactables.find((i) => i.id === id)
  if (!spec) return
  if (spec.stamp) usePass.getState().stamp(spec.stamp)
  clearRoute()
  inputState.move.set(0, 0)
  useInteraction.getState().openPanel(spec.panel)
}
