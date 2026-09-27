# Metakaizen v2 — Spec

> A web-first 3D world that looks like you walked into an anime: an Edgerunners-style megacity, explored on foot, where every place you can reach means something. One stop is Jake Posner's professional life; the others are showrooms for his 3D collection.

**Live URL:** metakaizen.com (links out to jakeposner.com, which stays on Squarespace)
**Branch:** `v2-central-station` (off `reset`)
**Status:** v2 direction locked 2026-09-27; Central Station style test approved as the starting point

---

## 1. Story

Metakaizen is a megacity at night. A **traveler** rides the elevated **Metakaizen Line**, a maglev whose every station opens onto a different world. The train ride between stations is the loading screen. When a new zone is built, a new station appears on the line map. That is the *kaizen* in the name: the city visibly keeps improving.

- **The traveler** is the visitor's own character (male anime lead, original design in the Edgerunners mold; see §3).
- **Jake** appears in the world as the **host**: a character who greets the traveler and tells the story at each landmark.
- **The transit pass** is the visitor's passport. Every landmark stamps it; it doubles as the map and fast travel. Completing a station's stamps unlocks a reward (contact card, hidden overlook).

### Stations

| # | Station | Zone | Status |
|---|---|---|---|
| 01 | **Central** 中央 | Career district: Netflix, Meta Reality Labs, fuboTV, Endeavor, ProjectNightOwl, Ronin Ventures, consulting, Vision Quest broadcast tower | building now |
| 02 | **Garage** | Vehicle showroom from Jake's collection; drive out into the city (arcade physics, doubles as fast travel) | planned |
| 03 | **Armory** | Firing range for his firearm + melee models: recoil, FX, sound, reload/combos, touch fire button | planned |
| 04 | **Lab** | Product inspector: orbit, zoom, explode any product model | planned |

### Rules for the world

1. **No filler.** Everything you can walk to is a destination, an exhibit, or something you can open. The dense skyline is backdrop — unreachable, like a painted matte in an anime.
2. **Walkable space is elevated**: platforms, bridges, plazas above the streets. The city spreads out below and around.
3. **Every destination has a URL.** Deep links land directly on it (`/#career`, later `/garage`).

---

## 2. Look

Reference: *Cyberpunk: Edgerunners* backgrounds and interiors (Jake's reference frames live in the session history).

| Element | Rule |
|---|---|
| Palette | Deep blue-violet everywhere. Color comes from light sources only: amber and cyan windows, a few screens, rare pink. |
| Shading | Two-tone cel shading (hard ramp), shadows tinted blue/violet, never black. Rim light on characters and hero props, tinted by area. |
| Neon | Restrained. Thin accent lines, small shop signs, screens with image content. No thick glowing tubes, no glowing building outlines. Bloom tight and subtle. |
| Buildings | Assembled from parts: podium + shopfronts, setback tiers, ledges, fins, rooftop clutter, antennas with blinking aviation lights. Windows lit in whole floors and runs, one dominant color per building. |
| Atmosphere | Moon, blue-lit clouds, layered haze with distance, canal reflections, flying traffic, slow searchlights. |
| Signage | Original brands only (Vision Quest, 浪 Ronin, 改善 Kaizen, メタカイゼン, invented shops). **No CD Projekt / Edgerunners characters, logos or brands.** |

### Stability rules (non-negotiable)

Procedural patterns must never shimmer when the camera moves:

- Window/pattern masks are **box-filtered with `fwidth()`**; patterns smaller than ~5 px fade to their average.
- Per-object seeds pass as **`flat` varyings**; hashes are **sine-free** (Hoskins).
- **No animated film grain** or other per-frame noise in post.

---

## 3. Decisions Locked

| # | Area | Decision |
|---|---|---|
| 1 | Stack | React Three Fiber + TypeScript + Vite; zustand for app state; mutable singletons for per-frame state |
| 2 | Physics | Rapier kinematic character controller (capsule). Colliders come from each zone's layout data. |
| 3 | Characters | **VRM** (`@pixiv/three-vrm`, MToon anime shading). Traveler: male anime lead, original design, built in VRoid Studio. Host: stylized Jake, built the same way. Female pixiv sample is a temporary stand-in. |
| 4 | Animation | Procedural walk/run/idle on the normalized humanoid rig now; Mixamo/VRMA clips later. |
| 5 | Camera | Third-person orbit (yaw, pitch, zoom), lazy follow, per-zone ceiling clamp. |
| 6 | Input | One `InputState`. Desktop: WASD/arrows, Shift run, drag to look, click to walk, scroll zoom, E interact. Touch: floating left joystick, drag to look, tap to walk / tap a landmark to walk there and open it. Gamepad + XR producers later. |
| 7 | Interaction | Proximity prompts (walk up → "E / TAP · Open …") plus tap-to-open on landmark meshes. Tap routes through the zone's walkable graph. |
| 8 | Zones | Registry of zones; one active zone scene at a time; per-zone lazy loading; train-ride transition between zones. |
| 9 | City | Pure TypeScript builders produce merged geometry (a few draw calls): parts kit, canal layout, megastructures, far instanced skyline, screens, water, haze. R3F only mounts the result. |
| 10 | Rendering | Tone mapping: Neutral. Post: bloom (tight) → grade (saturation, blue shadow lift, vignette, slight chromatic aberration) → output. Quality tiers: **High** (DPR ≤ 2, MSAA 4, canal reflections) / **Balanced** (DPR ≤ 1.5, fake water). Auto-picks Balanced on touch devices; remembered per device. |
| 11 | UI | Tailwind. Angular clip-corner glass panels, CP-yellow `#fcee0a` accent + cyan. Fonts: Chakra Petch (display), IBM Plex Mono (data), Noto Sans JP (subset, signage). HUD: line tag + location chip, prompt, pass, photo mode (H), quality/FPS. |
| 12 | Content | Typed content modules in `src/content/` — the single source for 3D panels and the future 2D classic view. Vision Quest editions pulled from its RSS later. |
| 13 | Persistence | localStorage only (pass stamps, quality, settings). Multiplayer later behind an `EntityStore`/`Transport` seam. |
| 14 | Hosting | Cloudflare Workers static assets (`wrangler.toml`), wrangler pinned **exactly** (4.30.0) — later versions demand `@cloudflare/vite-plugin` + Vite 6. Model files move to R2 when the asset pipeline lands. |
| 15 | VR | Architected for (input, in-world panels, 72–90 fps budget); shipped after the first launch. |

---

## 4. Architecture

```
src/
  app/            App shell, HUD, panels, loader, photo mode
  zones/          zone registry + one folder per station
    central/      station layout, walkable graph, interactables, panels
  city/           parts kit, buildings, canal city layout, megastructures,
                  far skyline, screens, water, haze  (pure TS → THREE objects)
  render/         cel/rim materials, window shaders, sky, post stack, quality
  player/         traveler controller, VRM avatar + procedural animation,
                  third-person camera, movement math (+ tests)
  input/          InputState + keyboard, pointer (mouse/touch/joystick) producers
  interaction/    proximity targeting, tap routing, detail panel store
  content/        career, Vision Quest, stations, signage copy
  lib/            seeded RNG, storage helpers
public/models/    traveler.vrm (temporary; moves to R2)
```

### Seams to honor

- **Zone** — `{ id, name, route, build(), walkable, interactables, spawn }`. Adding a station = adding a folder + a registry line.
- **Avatar** — VRM today; anything with the same `update(dt, motion)` shape later.
- **InputProducer** — each device writes to `InputState`; nothing reads devices directly.
- **Transport / EntityStore** — local now, networked later.
- **AssetCatalog** — manifest-driven model loading when R2 lands.

---

## 5. Asset Pipeline

Jake's 3D inventory (pop-culture avatars, vehicles, firearms, melee weapons) lives in S3 + Dropbox today. S3 stays the source archive; processed copies are served from **Cloudflare R2**.

Processing per model: normalize to GLB → Meshopt geometry + KTX2 textures (`gltf-transform`) → LODs → manifest entry. Every entry records **license, author, source URL** so items can be hidden from public view if their license doesn't allow it. Asset Studio (v1 plan: Cloudflare Access-gated uploader with Sketchfab zip parsing, preview, scale/orientation widgets) remains the long-term tool.

```ts
type AssetEntry = {
  id: string
  type: 'character' | 'vehicle' | 'weapon' | 'environment' | 'prop' | 'product'
  url: string
  size_bytes: number
  triangles: number
  draw_calls: number
  textures: number
  rig?: 'vrm' | 'mixamo' | 'none'
  animations: string[]
  zones: string[]                 // 'garage' | 'armory' | 'lab' | 'central'
  default_transform?: { position: number[]; rotation: number[]; scale: number }
  tags: string[]
  source: string
  source_url?: string
  author?: string
  license: string
  public: boolean                 // false = owner-only
  uploaded_at: string
}
```

---

## 6. Performance Budgets

| Zone | Draw calls | Triangles | Page weight (first load) |
|---|---|---|---|
| Central (station + city) | ≤ 150 | ≤ 400k | ≤ 10 MB incl. avatar |
| Showroom zones | ≤ 120 | ≤ 500k | streamed per model |

60 fps desktop and recent phones, 30 fps floor; 72–90 in VR when it ships. City geometry is merged into ~3 draw calls; far skyline is one instanced draw.

---

## 7. Build Order

1. **Foundation** *(this branch)* — spec, repo cleanup, pinned deps; port Central Station from the approved prototype into the app: render layer, city, station, VRM traveler, touch + desktop input, proximity/tap interaction, panels from content modules, transit pass, deep links, photo mode, quality tiers.
2. **Traveler + host** — male traveler in VRoid; Jake as host NPC with dialogue at landmarks; Mixamo/VRMA animation clips.
3. **Career district** — step through the Central gate into a district scene with one landmark per chapter; 2D classic view generated from the same content.
4. **Metakaizen Line** — train-ride transition, line map, zone registry routing; sealed stations visible.
5. **Asset pipeline** — R2, processing script, manifest, license gating.
6. **Garage** → 7. **Armory** → 8. **Lab**.
9. **Audio** — ambient city bed, footsteps, UI sounds; opt-in, remembered.
10. **VR** — WebXR mode on Quest.

---

## 8. Out of Scope (for now)

- Multiplayer (seam only)
- Accounts, user uploads
- Moving jakeposner.com off Squarespace or any DNS changes
- Using CD Projekt / Edgerunners IP (style inspiration only)
