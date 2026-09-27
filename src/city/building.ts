import { mulberry32, pick } from '@/lib/rng'
import { Kit, UNIT_BOX, UNIT_CYL } from './kit'

/** A screen/billboard to mount on a facade. `ad` names a texture in screens.ts. */
export interface SignSpec {
  x: number
  y: number
  z: number
  w: number
  h: number
  /** Rotation about Y so the plane faces outward. */
  ry: number
  /** 'h' / 'v' = any horizontal / vertical ad; otherwise a specific ad id. */
  ad: string
}

export interface Lot {
  x: number
  z: number
  w: number
  d: number
}

/** Mutable state a city layout accumulates while buildings are placed. */
export interface CityContext {
  kit: Kit
  groundY: number
  beacons: [number, number, number][]
  signs: SignSpec[]
  lots: Lot[]
}

export function createCityContext(groundY: number): CityContext {
  return { kit: new Kit(), groundY, beacons: [], signs: [], lots: [] }
}

/** Window/sign light colours: mostly amber and warm white, some cyan, rare pink. */
export const LIGHTS = ['#ffb65c', '#f3efd8', '#57d6ff', '#ffb65c', '#f3efd8', '#ff6a8e'] as const

export function overlaps(ctx: CityContext, x: number, z: number, w: number, d: number, gap = 3) {
  return ctx.lots.some((l) => Math.abs(l.x - x) < (l.w + w) / 2 + gap && Math.abs(l.z - z) < (l.d + d) / 2 + gap)
}

/**
 * One building: podium with shopfronts, 1–3 setback tiers (sometimes a
 * cylinder), ledges, fins, maybe stepped terraces, roof clutter, an antenna
 * with an aviation beacon, and maybe a screen on the face that looks at the
 * viewer. `face` is the unit direction [fx, fz] of that face (one of them 0).
 *
 * Deterministic for a given seed. Returns the roof height.
 */
export function building(ctx: CityContext, x: number, z: number, w: number, d: number, h: number, seed: number, face: [number, number]) {
  const { kit } = ctx
  const r = mulberry32(seed * 7919 + 13)
  ctx.lots.push({ x, z, w, d })
  const [fx, fz] = face
  const base = ctx.groundY
  const round = r() < 0.14
  const ph = 5 + r() * 7

  // podium + a lit shopfront band at street level
  kit.part('trim', UNIT_BOX, x, base, z, w + 2.4, ph, d + 2.4)
  kit.part('glow', UNIT_BOX, x, base + 1.1, z, w + 2.5, 0.8, d + 2.5, { color: pick(r, LIGHTS), k: 0.55 })

  // small shop signs along the street face
  const faceLen = fx ? d : w
  const nShops = 2 + Math.floor(r() * 3)
  for (let i = 0; i < nShops; i++) {
    const o = -faceLen / 2 + ((i + 0.5 + (r() - 0.5) * 0.4) * faceLen) / nShops
    const len = 2 + r() * 3
    const hh = 0.7 + r() * 1.1
    const yy = base + 2.6 + r() * (ph - 4)
    const sx = fx ? x + fx * (w / 2 + 1.35) : x + o
    const sz = fx ? z + o : z + fz * (d / 2 + 1.35)
    kit.part('glow', UNIT_BOX, sx, yy, sz, fx ? 0.2 : len, hh, fx ? len : 0.2, { color: pick(r, LIGHTS), k: 0.75 })
  }

  // tiers
  let y = base + ph
  let tw = w
  let td = d
  let rem = h - ph
  const nt = 1 + Math.floor(r() * 3)
  for (let i = 0; i < nt && rem > 8; i++) {
    const th = i === nt - 1 ? rem : rem * (0.45 + r() * 0.3)
    const cyl = round && i === 0
    kit.part('facade', cyl ? UNIT_CYL : UNIT_BOX, x, y, z, tw, th, td, { seed })
    if (r() < 0.7) {
      const every = 3.4 * (3 + Math.floor(r() * 6))
      for (let ly = y + every; ly < y + th - 2; ly += every) kit.part('trim', cyl ? UNIT_CYL : UNIT_BOX, x, ly, z, tw + 0.9, 0.4, td + 0.9)
    }
    if (!cyl && r() < 0.4) {
      const nf = 3 + Math.floor(r() * 5)
      const len = fx ? td : tw
      for (let k = 0; k < nf; k++) {
        const o = -len / 2 + ((k + 0.5) * len) / nf
        kit.part('trim', UNIT_BOX, fx ? x + fx * (tw / 2 + 0.3) : x + o, y, fx ? z + o : z + fz * (td / 2 + 0.3), 0.45, th * 0.97, 0.45)
      }
    }
    if (r() < 0.08) kit.part('glow', UNIT_BOX, x + tw / 2, y, z + td / 2, 0.16, th, 0.16, { color: pick(r, LIGHTS), k: 0.7 })
    y += th
    rem -= th
    tw *= 0.64 + r() * 0.2
    td *= 0.64 + r() * 0.2
  }

  // stepped terraces with warm lit edges, facing the street/canal
  if (r() < 0.16 && fx) {
    const steps = 4 + Math.floor(r() * 4)
    for (let s = 0; s < steps; s++) {
      const sy = base + ph + s * 3.4
      const out = (steps - s) * 1.3
      kit.part('trim', UNIT_BOX, x + fx * (w / 2 + out / 2), sy, z, out, 3.4, d * 0.85)
      kit.part('glow', UNIT_BOX, x + fx * (w / 2 + out), sy + 3.0, z, 0.18, 0.3, d * 0.85, { color: '#ffbf5e', k: 0.9 })
    }
  }

  // roof clutter, water tank, antenna + aviation beacon
  const nc = 2 + Math.floor(r() * 4)
  for (let k = 0; k < nc; k++) kit.part('trim', UNIT_BOX, x + (r() - 0.5) * tw * 0.7, y, z + (r() - 0.5) * td * 0.7, 1.5 + r() * 3.5, 0.8 + r() * 2.4, 1.5 + r() * 3.5)
  if (r() < 0.35) kit.part('trim', UNIT_CYL, x + (r() - 0.5) * tw * 0.5, y, z + (r() - 0.5) * td * 0.5, 2.6, 3 + r() * 2, 2.6)
  if (r() < 0.5) {
    const ah = 5 + r() * 22
    kit.part('trim', UNIT_BOX, x, y, z, 0.35, ah, 0.35)
    ctx.beacons.push([x, y + ah, z])
  } else ctx.beacons.push([x + tw * 0.35, y + 0.6, z + td * 0.35])

  // a screen on the face that looks at the viewer
  if (r() < 0.32 && h > 35) {
    const len = fx ? d : w
    const vert = r() < 0.4
    const sw = Math.min(len * 0.75, vert ? 7 + r() * 5 : 12 + r() * 12)
    const sh = vert ? sw * 1.9 : sw * 0.5
    const sy = base + ph + 4 + r() * Math.max(2, h * 0.55 - ph - sh)
    ctx.signs.push({ x: x + fx * (w / 2 + 0.45), y: sy + sh / 2, z: z + fz * (d / 2 + 0.45), w: sw, h: sh, ry: Math.atan2(fx, fz), ad: vert ? 'v' : 'h' })
  }
  return y
}
