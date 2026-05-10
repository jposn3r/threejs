import type { ReactNode } from 'react'
import type { InteractionMetadata } from './store'

interface InteractableProps extends InteractionMetadata {
  children: ReactNode
}

/**
 * Wraps a mesh/group as a targetable interactable. The `userData` carries
 * the metadata so the RaycastTarget can pick it up by walking up the
 * Object3D tree from a raycast hit.
 *
 * Visual outline is the responsibility of the children — call `useIsTargeted`
 * inside your mesh and conditionally render `<Outlines>`. This keeps the
 * Interactable API pure (no opinions on outline shader / color / thickness).
 */
export function Interactable({ children, ...metadata }: InteractableProps) {
  return (
    <group userData={{ interactableMeta: metadata }}>{children}</group>
  )
}
