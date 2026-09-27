import { useEffect } from 'react'
import { useInteraction } from '@/interaction/store'
import { isTouchDevice, useQuality } from '@/render/quality'
import type { ZoneDef } from '@/zones/types'
import { openInteractable } from '@/interaction/actions'
import { useUi } from './uiStore'

const touch = isTouchDevice()

function Kbd({ children }: { children: string }) {
  return <kbd className="kbd">{children}</kbd>
}

/**
 * Heads-up display: line tag + location, pass / photo / quality buttons,
 * the interact prompt, control hints. Keyboard: H photo mode, P pass, Esc.
 */
export function Hud({ zone }: { zone: ZoneDef }) {
  const placeId = useUi((s) => s.place)
  const photo = useUi((s) => s.photo)
  const setPhoto = useUi((s) => s.setPhoto)
  const fps = useUi((s) => s.fps)
  const nearby = useInteraction((s) => s.nearby)
  const panel = useInteraction((s) => s.panel)
  const openPanel = useInteraction((s) => s.openPanel)
  const closePanel = useInteraction((s) => s.closePanel)
  const quality = useQuality((s) => s.quality)
  const toggleQuality = useQuality((s) => s.toggle)
  const place = zone.places.find((p) => p.id === placeId) ?? zone.places[0]
  const prompt = nearby ? zone.interactables.find((i) => i.id === nearby) : null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.code === 'Escape') {
        if (useInteraction.getState().panel) closePanel()
        else setPhoto(false)
      } else if (e.code === 'KeyH') setPhoto(!useUi.getState().photo)
      else if (e.code === 'KeyP') {
        if (useInteraction.getState().panel === 'pass') closePanel()
        else openPanel('pass')
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [closePanel, openPanel, setPhoto])

  if (photo) {
    return (
      <button type="button" onClick={() => setPhoto(false)} className="chip cut fixed right-4 top-[calc(14px+env(safe-area-inset-top))] z-20 px-3 py-1.5 font-mono text-[11px] opacity-40 hover:opacity-100">
        EXIT PHOTO {touch ? '' : '· H'}
      </button>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-20 select-none">
      <div className="absolute left-4 top-[calc(14px+env(safe-area-inset-top))] flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.28em] text-neon-yellow">
          <i className="grid h-[18px] w-[18px] place-items-center rounded-full bg-neon-yellow text-[10px] not-italic tracking-normal text-ink">M</i>
          METAKAIZEN LINE
        </div>
        <div className="chip cut flex min-w-[200px] flex-col gap-0.5 border-l-[3px] border-l-neon-yellow py-2 pl-3.5 pr-4 max-sm:min-w-0">
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-neon-cyan">{place.sector}</span>
          <b className="flex items-baseline gap-2.5 text-xl font-semibold max-sm:text-[17px]">
            {place.name}
            <em className="font-jp text-[15px] not-italic text-ink-muted">{place.jp}</em>
          </b>
        </div>
      </div>

      <div className="pointer-events-auto absolute right-4 top-[calc(14px+env(safe-area-inset-top))] flex gap-2 max-sm:flex-col max-sm:items-end">
        <button type="button" className="hud-btn chip cut" onClick={() => (panel === 'pass' ? closePanel() : openPanel('pass'))}>
          PASS {!touch && <Kbd>P</Kbd>}
        </button>
        <button type="button" className="hud-btn chip cut" onClick={() => setPhoto(true)}>
          PHOTO {!touch && <Kbd>H</Kbd>}
        </button>
        <button type="button" className="hud-btn chip cut font-mono font-medium" onClick={toggleQuality} title="Switch graphics quality">
          {quality === 'high' ? 'HIGH' : 'BALANCED'} · {fps || '--'} FPS
        </button>
      </div>

      {prompt && !panel && (
        <button
          type="button"
          onClick={() => openInteractable(zone, prompt.id)}
          className="chip cut pointer-events-auto absolute bottom-[calc(92px+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap border-l-[3px] border-l-neon-yellow px-[18px] py-[11px] text-[15px] font-semibold"
        >
          {touch ? <span className="font-mono text-[11px] tracking-widest text-neon-yellow">TAP</span> : <Kbd>E</Kbd>}
          {prompt.label}
        </button>
      )}

      <div className="absolute bottom-[calc(14px+env(safe-area-inset-bottom))] left-4 flex max-w-[min(720px,calc(100%-32px))] flex-wrap gap-x-3.5 gap-y-1.5 font-mono text-[11px] opacity-85 [text-shadow:0_1px_4px_rgba(0,0,0,.8)]">
        {(touch
          ? [
              ['Left thumb', 'move'],
              ['Drag', 'look'],
              ['Tap', 'walk / open'],
            ]
          : [
              ['WASD', 'move'],
              ['Shift', 'run'],
              ['Drag', 'look'],
              ['Click', 'walk there'],
              ['Scroll', 'zoom'],
              ['E', 'interact'],
              ['H', 'photo mode'],
            ]
        ).map(([k, v]) => (
          <span key={k}>
            <i className="not-italic text-neon-yellow">{k}</i> {v}
          </span>
        ))}
      </div>
      <div className="absolute bottom-[calc(14px+env(safe-area-inset-bottom))] right-4 max-w-[280px] text-right font-mono text-[10px] text-ink-muted [text-shadow:0_1px_4px_rgba(0,0,0,.8)] max-md:hidden">
        Traveler: VRM sample by pixiv (temporary). City, station and signage are built in code.
      </div>
    </div>
  )
}
