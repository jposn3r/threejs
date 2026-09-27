import { mulberry32, type Rng } from '@/lib/rng'
import { building, createCityContext, overlaps, type CityContext } from './building'
import { UNIT_BOX } from './kit'

/**
 * The Central district's city: streets 50 m below the platform, a canal
 * running out from the overlook (−z), two rows of buildings on each bank,
 * low rooftops right under the station, a sky bridge with screens, an
 * elevated highway, a screen pylon, a far cable-stayed bridge, and the far
 * skyline as simple instanced towers.
 *
 * Pure geometry + data (no canvas, no GPU) so it can be unit tested.
 */
export const GROUND_Y = -50
export const CANAL = { half: 50, z0: -30, z1: -1260 } as const
/** The maglev runs along x at this z; nothing may be built across it. */
export const TRACK_Z = 8.6

export interface FarTower {
  x: number
  z: number
  w: number
  d: number
  top: number
}

export interface CanalCityLayout {
  ctx: CityContext
  farTowers: FarTower[]
  /** Extra instanced parts (antenna spires on far towers, the megatower). [x, y, z, w, h, d] */
  farParts: [number, number, number, number, number, number][]
  mega: { x: number; z: number; w: number; top: number }
  /** Line segments for bridge cables, flat [x0,y0,z0,x1,y1,z1, ...]. */
  cables: number[]
}

export function layoutCanalCity(seed = 2077): CanalCityLayout {
  const rng = mulberry32(seed)
  const ctx = createCityContext(GROUND_Y)
  let s = 1

  // canal banks: two rows each side, out to the horizon
  for (const side of [-1, 1]) {
    for (const row of [0, 1]) {
      let z = CANAL.z0 - 10 - rng() * 12
      const xStart = CANAL.half + 6 + row * 40
      while (z > CANAL.z1) {
        const w = 16 + rng() * 18
        const d = 14 + rng() * 20
        const x = side * (xStart + w / 2 + rng() * 3)
        const tall = rng() < 0.09
        const h = row === 0 ? 24 + rng() * 70 : 55 + rng() * 120 + (tall ? 130 : 0)
        building(ctx, x, z - d / 2, w, d, h, s++, [-side, 0])
        z -= d + 5 + rng() * 9
      }
    }
  }

  // around the station and behind the track: what you glimpse from the plazas
  for (let tries = 0, made = 0; made < 60 && tries < 2000; tries++) {
    const x = (rng() - 0.5) * 900
    const z = -60 + rng() * 460
    if (Math.abs(x) < 110 && z < 45) continue
    if (Math.abs(x) < CANAL.half + 90 && z < -20) continue
    const w = 18 + rng() * 20
    const d = 18 + rng() * 20
    if (Math.abs(z - TRACK_Z) < d / 2 + 8) continue
    if (overlaps(ctx, x, z, w, d)) continue
    const face: [number, number] = Math.abs(x) > Math.abs(z) ? [-Math.sign(x), 0] : [0, -Math.sign(z)]
    building(ctx, x, z, w, d, 35 + rng() * 150, s++, face)
    made++
  }

  // low rooftops right below the platform — the view you look down on
  for (let tries = 0, made = 0; made < 34 && tries < 3000; tries++) {
    const x = (rng() - 0.5) * 300
    const z = -45 + rng() * 95
    const ax = Math.abs(x)
    if (ax < CANAL.half + 4 && z < -26) continue
    if (ax < 84 && z > -24 && z < 10) continue
    const w = 12 + rng() * 14
    const d = 12 + rng() * 14
    if (Math.abs(z - TRACK_Z) < d / 2 + 5) continue
    if (overlaps(ctx, x, z, w, d)) continue
    const face: [number, number] = z < -20 ? [0, 1] : ax > Math.abs(z) ? [-Math.sign(x), 0] : [0, -Math.sign(z)]
    building(ctx, x, z, w, d, 14 + rng() * 26, s++, face)
    made++
  }

  const cables = megastructures(ctx)
  const far = farSkyline(rng, ctx)
  return { ctx, cables, ...far }
}

function megastructures(ctx: CityContext) {
  const { kit } = ctx
  const cables: number[] = []

  // sky bridge across the canal, carrying a row of screens
  {
    const Z = -240
    const Y = 2
    kit.part('facade', UNIT_BOX, 0, Y, Z, 300, 13, 11, { seed: 4242 })
    kit.part('trim', UNIT_BOX, 0, Y - 1.2, Z, 302, 1.2, 12)
    kit.part('trim', UNIT_BOX, 0, Y + 13, Z, 302, 0.8, 12)
    for (let x = -140; x <= 140; x += 20) kit.part('trim', UNIT_BOX, x, Y - 10, Z, 0.8, 10, 0.8, { rz: (x / 20) % 2 ? 0.5 : -0.5 })
    kit.part('glow', UNIT_BOX, 0, Y - 1.25, Z + 6.05, 300, 0.12, 0.12, { color: '#57d6ff', k: 0.7 })
    ;['vq', 'kaizen', 'stream', 'ronin', 'lumen'].forEach((ad, i) => ctx.signs.push({ x: -64 + i * 32, y: Y + 6.5, z: Z + 5.8, w: 15, h: 7.5, ry: 0, ad }))
    ctx.signs.push({ x: 22, y: Y - 8, z: Z + 2, w: 9, h: 4.5, ry: 0, ad: 'noodle' })
  }

  // elevated highway
  {
    const Z = -470
    const Y = -18
    kit.part('trim', UNIT_BOX, 0, Y - 1.8, Z, 1800, 1.8, 16)
    kit.part('trim', UNIT_BOX, 0, Y, Z - 7.8, 1800, 1.1, 0.4)
    kit.part('trim', UNIT_BOX, 0, Y, Z + 7.8, 1800, 1.1, 0.4)
    kit.part('glow', UNIT_BOX, 0, Y - 1.85, Z + 8.05, 1800, 0.1, 0.1, { color: '#57d6ff', k: 0.55 })
    for (let x = -840; x <= 840; x += 60) if (Math.abs(x) > CANAL.half + 6) kit.part('trim', UNIT_BOX, x, GROUND_Y, Z, 3.2, Y - 1.8 - GROUND_Y, 3.2)
  }

  // far cable-stayed bridge: a silhouette in the haze
  {
    const Z = -1080
    const Y = -24
    kit.part('trim', UNIT_BOX, 0, Y - 2.5, Z, 900, 2.5, 16)
    for (const sgn of [-1, 1]) kit.part('trim', UNIT_BOX, sgn * 5, GROUND_Y, Z, 2.4, 150, 3, { rz: sgn * 0.06 })
    kit.part('trim', UNIT_BOX, 0, GROUND_Y + 128, Z, 14, 2, 3)
    ctx.beacons.push([0, GROUND_Y + 152, Z])
    for (let i = 1; i <= 12; i++) for (const sgn of [-1, 1]) cables.push(0, GROUND_Y + 140, Z, sgn * i * 26, Y, Z)
    for (let x = -440; x <= 440; x += 18) kit.part('glow', UNIT_BOX, x, Y + 0.1, Z + 8, 0.5, 0.5, 0.5, { color: '#f3efd8', k: 0.9 })
  }

  // screen pylon on the right bank
  {
    const X = 58
    const Z = -150
    kit.part('trim', UNIT_BOX, X, GROUND_Y, Z, 2.2, 95, 2.2)
    ;(
      [
        ['kibo', -28],
        ['noodle', -12],
        ['mirai', 4],
        ['lumen', 20],
      ] as const
    ).forEach(([ad, y], i) => ctx.signs.push({ x: X - 1.3, y, z: Z + (i % 2 ? 1.5 : -1.5), w: 12, h: 6, ry: Math.atan2(-X, 150), ad }))
  }

  // embankment walls and the lamp line along the water
  for (const sgn of [-1, 1]) {
    kit.part('trim', UNIT_BOX, sgn * (CANAL.half + 1), GROUND_Y - 5, (CANAL.z0 + CANAL.z1) / 2, 2, 5.4, CANAL.z0 - CANAL.z1)
    for (let z = CANAL.z0 - 6; z > CANAL.z1; z -= 14) kit.part('glow', UNIT_BOX, sgn * (CANAL.half + 0.2), GROUND_Y + 0.9, z, 0.3, 0.3, 0.3, { color: '#ffd7a0', k: 1.1 })
  }
  return cables
}

function farSkyline(rng: Rng, ctx: CityContext) {
  const farTowers: FarTower[] = []
  for (let tries = 0; farTowers.length < 380 && tries < 20000; tries++) {
    const a = rng() * Math.PI * 2
    const r = 480 + Math.pow(rng(), 0.7) * 1250
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (Math.abs(x) < 190 && z < 60 && z > -1300) continue
    if (Math.abs(z - TRACK_Z) < 18) continue
    const w = 26 + rng() * 40
    const d = 26 + rng() * 40
    if (farTowers.some((t) => Math.abs(t.x - x) < (t.w + w) * 0.55 && Math.abs(t.z - z) < (t.d + d) * 0.55)) continue
    const top = rng() < 0.05 ? 220 + rng() * 150 : -10 + rng() * 170
    farTowers.push({ x, z, w, d, top })
  }
  const farParts: [number, number, number, number, number, number][] = farTowers.map((t) => [t.x, GROUND_Y, t.z, t.w, t.top - GROUND_Y, t.d])
  for (const t of farTowers) {
    if (rng() < 0.4) {
      const sh = 10 + rng() * 30
      farParts.push([t.x, t.top, t.z, 1.2, sh, 1.2])
      ctx.beacons.push([t.x, t.top + sh, t.z])
    } else ctx.beacons.push([t.x, t.top + 1, t.z])
  }
  const mega = { x: -300, z: -920, w: 70, top: 470 }
  farParts.push(
    [mega.x, GROUND_Y, mega.z, mega.w, mega.top - GROUND_Y, mega.w * 0.8],
    [mega.x, mega.top, mega.z, mega.w * 0.55, 80, mega.w * 0.45],
    [mega.x, mega.top + 80, mega.z, 2, 110, 2],
  )
  ctx.beacons.push([mega.x, mega.top + 190, mega.z])
  ctx.signs.push({ x: mega.x + 30, y: 250, z: mega.z + mega.w * 0.4 + 2, w: 34, h: 68, ry: 0, ad: 'kana' })
  return { farTowers, farParts, mega }
}
