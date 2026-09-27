import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { useUi } from './uiStore'

/** Full-screen loading card until the first frame renders, then fades out. */
export function Loader() {
  const ready = useUi((s) => s.ready)
  const { progress } = useProgress()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [ready])

  if (gone) return null
  const pct = ready ? 100 : Math.max(8, Math.round(progress * 0.9))
  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-[radial-gradient(ellipse_at_50%_110%,#2a1f6e_0%,#0b1030_55%,#05071a_100%)] transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex w-[min(340px,calc(100%-32px))] flex-col gap-2.5">
        <div className="text-xs font-bold tracking-[0.32em] text-neon-yellow">METAKAIZEN LINE</div>
        <div className="flex items-baseline gap-3 text-3xl font-semibold">
          Central Station <em className="font-jp text-xl not-italic text-ink-muted">中央駅</em>
        </div>
        <div className="h-[3px] overflow-hidden bg-neon-cyan/15">
          <i className="block h-full bg-neon-cyan shadow-[0_0_12px_#3ff2ff] transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
        <div className="font-mono text-[11px] text-ink-muted">{ready ? 'Doors opening' : progress < 100 ? 'Waking the traveler' : 'Raising the skyline'}</div>
      </div>
    </div>
  )
}
