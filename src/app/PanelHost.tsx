import { useEffect, useRef } from 'react'
import { useInteraction } from '@/interaction/store'
import { panelsByZone } from './panels'
import { useUi } from './uiStore'

/** Modal overlay for the open panel. Esc, the close button or the backdrop closes it. */
export function PanelHost() {
  const panel = useInteraction((s) => s.panel)
  const close = useInteraction((s) => s.closePanel)
  const zoneId = useUi((s) => s.zoneId)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (panel) closeRef.current?.focus()
  }, [panel])

  if (!panel) return null
  const Panel = panelsByZone[zoneId]?.[panel]
  if (!Panel) return null

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 p-4" onClick={(e) => e.target === e.currentTarget && close()}>
      <div role="dialog" aria-modal="true" className="panel cut relative max-h-[min(80vh,740px)] w-[min(580px,100%)] overflow-auto">
        <button ref={closeRef} type="button" onClick={close} className="absolute right-3.5 top-3 p-1.5 font-mono text-[11px] text-ink-muted hover:text-ink-text">
          ESC · CLOSE
        </button>
        <Panel />
      </div>
    </div>
  )
}
