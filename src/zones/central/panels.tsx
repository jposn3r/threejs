import type { ComponentType, ReactNode } from 'react'
import { profile, roles } from '@/content/career'
import { stations } from '@/content/stations'
import { visionQuest } from '@/content/visionQuest'
import { usePass } from '@/interaction/store'

/** Panels opened from Central Station's interactables. Content comes from src/content. */

function Eyebrow({ color, children }: { color: string; children: ReactNode }) {
  return <div className={`font-mono text-[11px] tracking-[0.18em] ${color}`}>{children}</div>
}

function Career() {
  return (
    <>
      <Eyebrow color="text-neon-yellow">STATION 01 · CAREER DISTRICT · STAMPED</Eyebrow>
      <h2 className="panel-title">{profile.headline}</h2>
      <p className="panel-lede">{profile.intro} In the full build this gate opens onto the district itself, with a landmark per chapter.</p>
      <div className="flex flex-col gap-3">
        {roles.map((r) => (
          <div key={r.org} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-t border-white/10 pt-3">
            <h3 className="text-[17px] font-semibold">
              {r.org} · <span className="font-medium text-ink-text/80">{r.title}</span>
            </h3>
            <time className="self-center font-mono text-[11px] tabular-nums text-ink-muted">{r.when}</time>
            <p className="col-span-2 mt-0.5 font-mono text-[12.5px] leading-relaxed text-ink-text/85">{r.summary}</p>
            {r.stats && (
              <div className="col-span-2 mt-1.5 flex flex-wrap gap-2">
                {r.stats.map((s) => (
                  <span key={s} className="border border-neon-yellow/40 px-2 py-1 font-mono text-[11px] text-neon-yellow">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {profile.links.map((l, i) => (
          <a key={l.href} className={i === 0 ? 'cta' : 'cta cta-ghost'} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
        ))}
      </div>
    </>
  )
}

function VisionQuest() {
  return (
    <>
      <Eyebrow color="text-neon-mint">STATION 01 · VISION QUEST BROADCAST · STAMPED</Eyebrow>
      <h2 className="panel-title">{visionQuest.tagline}</h2>
      <p className="panel-lede">{visionQuest.blurb}</p>
      <ul className="flex flex-col gap-2">
        {visionQuest.latest.map((e) => (
          <li key={e.title} className="grid grid-cols-[58px_1fr] gap-2.5 font-mono text-[12.5px] leading-snug">
            <time className="tabular-nums text-ink-muted">{e.date}</time>
            <span>{e.title}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <a className="cta" href={visionQuest.href} target="_blank" rel="noopener noreferrer">
          Read Vision Quest ↗
        </a>
      </div>
    </>
  )
}

function Line() {
  return (
    <>
      <Eyebrow color="text-neon-yellow">ROUTE MAP · 路線図</Eyebrow>
      <h2 className="panel-title">Metakaizen Line</h2>
      <p className="panel-lede">Every stop is its own world. New stations open as new zones are built.</p>
      <ol className="ml-1.5 border-l-[3px] border-neon-yellow">
        {stations.map((s) => (
          <li key={s.id} className={`-ml-[13.5px] grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5 ${s.open ? '' : 'opacity-55'}`}>
            <i className={`h-[18px] w-[18px] rounded-full border-[3px] border-neon-yellow ${s.open ? 'bg-neon-yellow shadow-[0_0_12px_rgba(252,238,10,.6)]' : 'bg-ink'}`} />
            <b className="text-base">
              {s.name}
              {s.jp && <em className="ml-2 font-jp text-[13px] not-italic text-ink-muted">{s.jp}</em>}
            </b>
            <small className="font-mono text-[11px] tracking-wider text-ink-muted">{s.open ? 'YOU ARE HERE' : `${s.blurb.toUpperCase()} · SOON`}</small>
          </li>
        ))}
      </ol>
    </>
  )
}

const STAMPS = [
  { id: 'career', jp: '中央', label: 'CAREER GATE' },
  { id: 'visionquest', jp: '放送', label: 'VISION QUEST' },
]

function Pass() {
  const stamps = usePass((s) => s.stamps)
  const got = STAMPS.filter((s) => stamps[s.id]).length
  return (
    <>
      <Eyebrow color="text-neon-magenta">TRANSIT PASS · 乗車券</Eyebrow>
      <h2 className="panel-title">
        {got}/{STAMPS.length} Central stamps
      </h2>
      <p className="panel-lede">Visit a landmark to stamp your pass. Filling a station unlocks a reward. Your pass is saved on this device.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
        {STAMPS.map((s) =>
          stamps[s.id] ? (
            <div key={s.id} className="stamp stamp-on">
              <b className="block font-jp text-[26px] text-neon-magenta">{s.jp}</b>
              {s.label}
            </div>
          ) : (
            <div key={s.id} className="stamp">
              {s.label}
              <br />
              not stamped
            </div>
          ),
        )}
        {stations
          .filter((s) => !s.open)
          .map((s) => (
            <div key={s.id} className="stamp">
              {s.name.toUpperCase()}
              <br />
              soon
            </div>
          ))}
      </div>
    </>
  )
}

export const centralPanels: Record<string, ComponentType> = {
  career: Career,
  visionquest: VisionQuest,
  line: Line,
  pass: Pass,
}
