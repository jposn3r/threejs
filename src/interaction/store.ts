import { create } from 'zustand'

/**
 * Metadata that travels with an interactable, displayed in the detail
 * view when E is pressed.
 */
export interface InteractionMetadata {
  id: string
  title: string
  description: string
  /** Optional CTA shown in the detail view. */
  ctaLabel?: string
  /** Fired when the CTA is clicked. M5 logs to console; M6 wires navigation. */
  onCTA?: () => void
}

interface InteractionStore {
  /** Currently targeted (look-at) interactable, or null. Set by RaycastTarget. */
  targeted: InteractionMetadata | null
  setTargeted: (m: InteractionMetadata | null) => void

  /** Whatever is currently open in the detail view, or null. */
  detailView: InteractionMetadata | null
  openDetailView: (m: InteractionMetadata) => void
  closeDetailView: () => void
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  targeted: null,
  setTargeted: (m) => set({ targeted: m }),

  detailView: null,
  openDetailView: (m) => set({ detailView: m }),
  closeDetailView: () => set({ detailView: null }),
}))

/** Hook for interactable components to know if they should render the outline. */
export function useIsTargeted(id: string): boolean {
  return useInteractionStore((s) => s.targeted?.id === id)
}
