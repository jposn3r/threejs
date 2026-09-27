import { create } from 'zustand'

/** HUD-facing state that changes rarely (never per frame). */
interface UiStore {
  zoneId: string
  /** Place id within the zone (drives the location chip). */
  place: string
  setPlace: (place: string) => void
  /** Photo mode hides the HUD. */
  photo: boolean
  setPhoto: (photo: boolean) => void
  fps: number
  setFps: (fps: number) => void
  /** The world has built and rendered its first frame. */
  ready: boolean
  setReady: () => void
}

export const useUi = create<UiStore>((set) => ({
  zoneId: 'central',
  place: 'central',
  setPlace: (place) => set({ place }),
  photo: false,
  setPhoto: (photo) => set({ photo }),
  fps: 0,
  setFps: (fps) => set({ fps }),
  ready: false,
  setReady: () => set({ ready: true }),
}))
