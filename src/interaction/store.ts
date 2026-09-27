import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Interaction state: what's close enough to use, and which panel is open.
 * Panels are identified by id; the zone's panel registry renders them.
 */
interface InteractionStore {
  /** Interactable in range of the traveler, or null. Set by <Proximity />. */
  nearby: string | null
  setNearby: (id: string | null) => void
  /** Open panel id, or null. */
  panel: string | null
  openPanel: (id: string) => void
  closePanel: () => void
}

export const useInteraction = create<InteractionStore>((set) => ({
  nearby: null,
  setNearby: (nearby) => set({ nearby }),
  panel: null,
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
}))

/** Transit pass: stamps collected by visiting landmarks. Saved on this device. */
interface PassStore {
  stamps: Record<string, number>
  stamp: (id: string) => void
}

export const usePass = create<PassStore>()(
  persist(
    (set, get) => ({
      stamps: {},
      stamp: (id) => {
        if (!get().stamps[id]) set({ stamps: { ...get().stamps, [id]: Date.now() } })
      },
    }),
    { name: 'mk-pass', storage: createJSONStorage(() => localStorage) },
  ),
)
