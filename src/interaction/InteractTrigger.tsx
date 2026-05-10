import { useFrame } from '@react-three/fiber'
import { inputState } from '@/input/InputState'
import { useInteractionStore } from './store'

/**
 * Per-frame: when the player presses E (`inputState.interact` edge trigger)
 * AND something is currently targeted, open the detail view with that
 * target's metadata. Always consume the edge trigger.
 *
 * Skips when a detail view is already open — pressing E inside the
 * modal shouldn't immediately re-open it on top of itself.
 */
export function InteractTrigger() {
  useFrame(() => {
    if (!inputState.interact) return
    const { targeted, detailView, openDetailView } =
      useInteractionStore.getState()

    if (targeted && !detailView) {
      openDetailView(targeted)
    }
    inputState.interact = false
  })

  return null
}
