import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { Color } from 'three'
import { inputState } from '@/input/InputState'
import { playerState } from '@/player/playerState'
import { RIM } from '@/render/materials'
import { useUi } from '@/app/uiStore'
import type { ZoneDef } from '@/zones/types'
import { openInteractable } from './actions'
import { useInteraction } from './store'

/**
 * Per frame: which interactable is in range (drives the prompt and E),
 * which place the traveler is in (drives the location chip), and the rim
 * light colour of that place.
 */
export function Proximity({ zone }: { zone: ZoneDef }) {
  const rimTarget = useMemo(() => new Color(), [])

  useFrame((_, delta) => {
    const p = playerState.position
    let nearby: string | null = null
    let best = Infinity
    for (const it of zone.interactables) {
      const d = Math.hypot(p.x - it.at[0], p.z - it.at[1])
      if (d < it.radius && d < best) {
        best = d
        nearby = it.id
      }
    }
    const ix = useInteraction.getState()
    if (ix.nearby !== nearby) ix.setNearby(nearby)
    if (inputState.interact) {
      inputState.interact = false
      if (nearby && !ix.panel) openInteractable(zone, nearby)
    }

    const placeId = zone.placeAt(p.x, p.z)
    const ui = useUi.getState()
    if (ui.place !== placeId) ui.setPlace(placeId)
    const place = zone.places.find((pl) => pl.id === placeId)
    if (place) RIM.value.lerp(rimTarget.set(place.rim), 1 - Math.exp(-3 * Math.min(delta, 0.1)))
  })

  return null
}
