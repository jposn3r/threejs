import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Graphics quality tier.
 *  - high:     DPR ≤ 2, MSAA ×4, planar canal reflections
 *  - balanced: DPR ≤ 1.5, no MSAA, cheap fake water
 * Touch devices start on balanced. The choice is remembered per device.
 */
export type Quality = 'high' | 'balanced'

export const isTouchDevice = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window)

interface QualityStore {
  quality: Quality
  toggle: () => void
}

export const useQuality = create<QualityStore>()(
  persist(
    (set, get) => ({
      quality: isTouchDevice() ? 'balanced' : 'high',
      toggle: () => set({ quality: get().quality === 'high' ? 'balanced' : 'high' }),
    }),
    { name: 'mk-quality', storage: createJSONStorage(() => localStorage) },
  ),
)

export const maxDpr = (q: Quality) => (q === 'high' ? 2 : 1.5)
