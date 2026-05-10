import { useEffect } from 'react'
import { useInteractionStore } from '@/interaction/store'

/**
 * Modal overlay shown when an Interactable is interacted with (E key).
 * Reads the currently-open detail view from the interaction store; renders
 * nothing when nothing is open.
 *
 * Closes on Escape. Click on the dimmed backdrop also closes.
 *
 * Future polish (deferred from M5):
 *   - in-world camera transition (camera orbits the object, player fades out)
 *   - object preview rendered into the modal via a portal canvas
 * For now, the dimmed backdrop + glass-panel modal carries the moment.
 */
export function DetailView() {
  const detailView = useInteractionStore((s) => s.detailView)
  const close = useInteractionStore((s) => s.closeDetailView)

  useEffect(() => {
    if (!detailView) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailView, close])

  if (!detailView) return null

  const { title, description, ctaLabel, onCTA } = detailView

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center"
      onClick={close}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className="relative z-10 w-[min(560px,90vw)] rounded-lg border border-accent-500/40 bg-ink/95 p-6 shadow-[0_0_60px_rgba(16,185,129,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-accent-400">
          Specimen
        </div>
        <h2 className="mb-3 font-display text-2xl font-medium text-white">
          {title}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-white/70">
          {description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-widest text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
          >
            Close <span className="ml-1 font-mono opacity-60">Esc</span>
          </button>

          {ctaLabel && onCTA && (
            <button
              type="button"
              onClick={() => {
                onCTA()
                close()
              }}
              className="rounded-md border border-accent-400/60 bg-accent-500/15 px-4 py-2 text-xs font-medium uppercase tracking-widest text-accent-300 transition-colors hover:bg-accent-500/25 hover:text-accent-200"
            >
              {ctaLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
