# Metakaizen v1 — Spec

> A web-first, video-game-style 3D experience to showcase 3D models (characters, vehicles, weapons, environments) and demonstrate performant 3D on the web across desktop, mobile, and VR.

**Live URL:** metakaizen.com
**Branch:** `reset` (clean rebuild)
**Status:** spec locked, ready for build

---

## 1. Vision & Experience

You spawn into a **hangout** as your avatar. Walk around. Doors/portals lead to a **hangar** (vehicles, planes, spaceships) and a **dojo** (weapons). Each space is a curated showcase of 3D assets you own. Future: friends join your spaces, users upload their own models, gameplay loops to earn more assets.

### v1 Scope

- Three scenes: **hangout (hub)**, **hangar**, **dojo**
- Third-person avatar movement (walk / run / jump)
- VR support (first-person, teleport locomotion)
- Mobile, desktop, gamepad, VR controls
- **Asset Studio**: admin tool for diagnosing, processing, and integrating 3D assets
- 2D HUD with first-visit tooltip
- Single ambient track per scene + spatial SFX

### Future (post-v1, architected for, not built)

- Multiplayer (host-and-guest rooms via PartyKit)
- User accounts (Supabase Auth)
- User-uploaded assets
- Drivable vehicles
- Game mechanics to earn assets
- Facial expressions / lipsync (VRM migration)

---

## 2. Decisions Locked

| # | Area | Decision |
|---|---|---|
| 1 | Perspective | 3rd-person desktop/mobile, 1st-person VR, hybrid camera moments for inspection |
| 2 | Stack | **React Three Fiber + TypeScript** |
| 3 | Physics | **Rapier** kinematic character controller; capsule; auto-gen colliders; walk/run/jump |
| 4 | Avatars | **Mixamo humanoid** (GLB); placeholder character to start; humanoid-only players in v1; no facial/lipsync v1; `Avatar` abstraction allows VRM swap later |
| 5 | Asset hosting | **Cloudflare R2 + CDN**; clean slate from old S3; Meshopt + KTX2 compression; JSON manifest catalog; migrate to Supabase later |
| 6 | World structure | **Hub-and-spoke + URL-per-scene**; fade-to-black transitions; deep links land straight in; first-visit HUD tooltip in localStorage |
| 7 | Input | Single `InputState` abstraction; teleport + snap-turn VR; floating left-joystick + drag-to-look mobile; pointer-lock desktop; auto-detect device glyphs; **Fortnite-style lazy-follow camera** |
| 8 | UI | **Tailwind + shadcn/ui + Framer Motion**; dark glass HUD aesthetic (Cyberpunk 2077 menus); green accent (swappable); **Space Grotesk** display font; **Lucide** icons |
| 9 | Performance | iPhone 11+ / Pixel 5+ floor; auto quality tiers + Lite-mode fallback; 60 fps desktop/mobile, 30 floor, **90 mandatory in VR**; bloom + tone mapping always; SSAO on High; nothing in VR; dev budget HUD |
| 10 | Multiplayer hooks | `EntityStore` + `Transport` interface (LocalTransport v1, NetworkTransport later); **Zustand** for state; client-auth movement, server-auth room state; host-and-guest model; **PartyKit** flagged as future networking |
| 11 | Identity | **Cloudflare Access** for Asset Studio; anonymous device UUID + skippable display name in localStorage ("Wanderer-XXXX" default); Supabase Auth as future migration |
| 12 | Hosting & pipeline | **Migrate Amplify → Cloudflare Pages + Workers**; manifest as JSON in R2 with versioning; **client-side `gltf-transform` (WASM)** processing in Asset Studio; Pages auto-deploy + GitHub Actions for typecheck/lint |
| 13 | Audio | drei `<PositionalAudio>` + `<Audio>`; one ambient track per scene; master + per-channel volume; unmuted at 20% on first visit; OGG Vorbis |
| 14 | Observability | **Sentry** (errors + perf + replays); **Cloudflare Web Analytics** (no cookies); localStorage-only persistence v1; Asset Studio writes straight to manifest in R2 |

---

## 3. Architecture Skeleton

```
metakaizen/
├── src/
│   ├── app/                    # App shell, router, providers
│   │   ├── App.tsx
│   │   ├── routes.tsx          # / (hub), /hangar, /dojo, /studio
│   │   └── providers.tsx       # R3F, Sentry, Auth, Audio
│   ├── core/
│   │   ├── EntityStore.ts      # Zustand store; player + future remote entities
│   │   ├── Transport.ts        # interface; LocalTransport v1
│   │   ├── AssetCatalog.ts     # reads manifest.json from R2
│   │   ├── AssetLoader.ts      # GLTFLoader + Meshopt + KTX2 decoders
│   │   ├── DisposalRegistry.ts # tracks GPU resources for clean teardown
│   │   ├── SceneManager.ts     # mount/unmount, transition coordinator
│   │   └── QualityTier.ts      # auto-detect + override
│   ├── input/
│   │   ├── InputState.ts       # the shared abstraction
│   │   ├── KeyboardProducer.ts
│   │   ├── MouseProducer.ts
│   │   ├── TouchProducer.ts    # @use-gesture
│   │   ├── GamepadProducer.ts
│   │   └── XRProducer.ts
│   ├── player/
│   │   ├── Avatar.tsx          # interface + Mixamo implementation
│   │   ├── CharacterController.tsx  # Rapier kinematic, reads InputState
│   │   ├── ThirdPersonCamera.tsx    # Fortnite lazy-follow
│   │   └── animations/         # mixamo glb refs + name registry
│   ├── scenes/
│   │   ├── hub/
│   │   ├── hangar/
│   │   └── dojo/
│   │       └── each: Scene.tsx, lighting.tsx, props.tsx, audio.ts
│   ├── components/             # reusable 3D
│   │   ├── Portal.tsx
│   │   ├── ShowcasePedestal.tsx
│   │   └── StarField.tsx       # salvaged from old MetaScene
│   ├── ui/                     # 2D React UI
│   │   ├── HUD.tsx
│   │   ├── Settings.tsx
│   │   ├── FirstVisitTooltip.tsx
│   │   ├── InputGlyph.tsx
│   │   ├── MobileControls.tsx
│   │   └── primitives/         # shadcn copies
│   ├── studio/                 # Asset Studio (admin)
│   │   ├── StudioApp.tsx
│   │   ├── Uploader.tsx        # gltf-transform WASM
│   │   ├── Inspector.tsx       # rig + animations + metadata
│   │   ├── Preview.tsx         # 3D viewer with animation playback
│   │   └── ManifestEditor.tsx
│   ├── audio/
│   │   ├── AudioBus.ts         # master + channels
│   │   └── tracks.ts           # per-scene refs
│   └── lib/
│       ├── deviceUUID.ts
│       └── env.ts
├── public/
│   ├── placeholder-avatar.glb
│   └── animations/             # mixamo glbs (idle, walk, run, jump_*)
├── functions/                  # Cloudflare Workers
│   └── upload.ts               # signed PUT URL for R2
├── SPEC.md                     # this file
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── wrangler.toml               # Cloudflare config
```

### Key abstractions to honor

- **`Avatar` interface** — swap Mixamo → VRM later by implementing the same shape
- **`Transport` interface** — swap Local → PartyKit later
- **`AssetCatalog` interface** — swap R2-JSON → Supabase later
- **`InputProducer` interface** — every device source plugs in cleanly

These four are the seams that keep "expedite v1" and "scale to north star" both true.

---

## 4. Asset Pipeline

### Sources

Primary intake is **third-party marketplaces** (Sketchfab, CGTrader, Quaternius, KayKit, Poly Pizza). Authoring in Blender supported but not required.

**Sketchfab zip ingestion (v1):** Studio accepts the raw `.zip` from a Sketchfab download. It auto-parses bundled `license.txt` / `source.txt` to pre-fill `license`, `source_url`, and `author` in the metadata form. User reviews + confirms before upload. Same logic generalizes to other marketplaces' bundle formats over time.

### Supported input formats

| Format | Pipeline |
|---|---|
| **GLB** | direct → `gltf-transform` |
| **GLTF + buffers** | direct → `gltf-transform` |
| **FBX** | Three.js `FBXLoader` → `GLTFExporter` → GLB → `gltf-transform` |
| **OBJ** | `OBJLoader` → `GLTFExporter` → GLB → `gltf-transform` (static only — no rigs) |

### Authoring → live flow

1. Source asset (Sketchfab download, etc.) or author in Blender
2. Open Asset Studio (`/studio`, behind Cloudflare Access)
3. Drag-and-drop GLB / GLTF / FBX / OBJ → Studio normalizes to GLB if needed
4. Studio inspects: rig type, animations, vertex count, draw calls, texture count, materials (flags non-PBR), file size
5. Preview with animation playback + **scale slider** + **orientation widget** (sketchfab assets vary wildly here; chosen transform bakes into manifest)
6. Fill license metadata: `license`, `author`, `source_url` (required for attribution; CC-BY etc.)
7. Click **Process & Upload** → `gltf-transform` runs Meshopt + KTX2 in-browser
8. Optimized GLB uploads to R2 via signed PUT URL from a Worker
9. Manifest entry created/updated in R2 (`manifest.json`)
10. Public app picks it up on next load (CDN-cached, edge TTL ~1h)

### Manifest schema (v1 sketch)

```ts
type AssetEntry = {
  id: string                   // 'avatar-cyberpunk-01'
  type: 'character' | 'vehicle' | 'weapon' | 'environment' | 'prop'
  url: string                  // R2 public URL (processed GLB)
  size_bytes: number
  triangles: number
  draw_calls: number
  textures: number
  rig?: 'mixamo' | 'vrm' | 'none'
  animations: string[]         // ['idle', 'walk', ...]
  scenes: string[]             // ['hangar', 'dojo'] - which scenes showcase this
  default_transform?: { position, rotation, scale }  // baked from Studio
  tags: string[]
  uploaded_at: string

  // Source & licensing (required — attribution & legal)
  source: 'sketchfab' | 'cgtrader' | 'quaternius' | 'kaykit' | 'poly-pizza' | 'blender' | 'mixamo' | 'other'
  source_url?: string          // link back to original (Sketchfab page, etc.)
  author?: string              // original creator
  license: string              // 'CC-BY-4.0' | 'CC0' | 'royalty-free' | 'sketchfab-standard' | etc.
  original_format: 'glb' | 'gltf' | 'fbx' | 'obj'
}

type Manifest = { version: number; assets: AssetEntry[] }
```

---

## 5. Performance Budgets

| Scene | Triangles | Draw calls | Lights | Texture mem |
|---|---|---|---|---|
| Hub (hangout) | 100k | 30 | 3-4 | 80 MB |
| Hangar | 200k | 50 | 4-6 | 150 MB |
| Dojo | 80k | 30 | 3-4 | 80 MB |

**Frame rates:** 60 desktop/mobile, 30 floor, **90 VR mandatory**

**Asset Studio enforces** — uploads show "% of scene budget consumed" at upload time.

---

## 6. Build Order (Milestones)

Each milestone is a shippable checkpoint; v1 = milestone 12.

1. **Hosting cutover** — DNS + CF Pages + disable Amplify
2. **Scaffold** — Vite + React + TS + Tailwind + R3F + shadcn + Sentry skeleton
3. **Player sandbox** — flat floor, placeholder avatar, Rapier capsule, camera, WASD
4. **Input layer** — keyboard + mouse + gamepad producers; `InputState` abstraction
5. **Interaction system + hub specimens** — raycast-from-reticle, edge-glow outline on look, "Press E to inspect" prompt, detail view UI with CTA. Placeholder hub specimens (vehicle, weapon) demonstrating the pattern. Replaces the originally planned door-portal navigation — see §8.
6. **Scene routing + transitions + HUD unlock progression** — URL-per-scene, fade-to-black, deep linking. Detail view CTAs wired to navigate. Visited scenes persist to localStorage and surface as fast-travel icons in a top-right HUD row.
7. **Hangar + Dojo content scenes** — distinct lighting/music. Each holds a collection of items, each item using the same Interactable + DetailView components from M5.
8. **Asset infrastructure** — R2 bucket + Worker upload endpoint + manifest schema
9. **Asset Studio v0** — Cloudflare Access gate, multi-format upload (GLB/GLTF/FBX/OBJ + Sketchfab zip auto-parse for license/source/author), gltf-transform, preview with scale + orientation widgets, manifest write
10. **First real assets** — onboard placeholder avatar properly + 1-2 showcase models per scene
11. **Mobile controls + UI polish** — floating joystick, settings panel, first-visit tooltip, glyphs
12. **VR hookup + ship v1** — `@react-three/xr`, teleport locomotion, VR-tier perf, Sentry + Analytics live

Estimated rough sequence — adjust as we go.

---

## 7. Interaction Model

The hub is a museum/gallery, not a hallway with doors. Each space is gated by a **specimen object** in the hub — a hero vehicle, a hero weapon, etc. Walking up and looking at one triggers an outline glow + "Press E to inspect" prompt. E opens a **detail view** with metadata + an explicit CTA ("Visit the Hangar →") that navigates to the full collection.

Once a scene has been visited, it appears as a fast-travel icon in the HUD's top-right row. Clicking the icon uses the same scene-transition pipeline as the CTA. localStorage persists the unlocked set across sessions; this becomes a real backend at 1.0.

**Why this over door portals:** the project IS a 3D model showcase. Specimen-driven discovery turns the hub into a teaser, makes the player curious *about the models* (the actual product), and reuses the same DetailView component for both single-item inspection and per-item interaction inside the hangar/dojo. Portals would bypass the models entirely.

**Reusable components:**
- `<Interactable id title description ctaLabel onCTA>` — wraps any mesh, registers it with the interaction system
- `<RaycastTarget>` — per-frame camera-through-reticle raycast, sets store's `targeted`
- `<InteractTrigger>` — listens for `inputState.interact`, opens detail view of currently-targeted
- `<DetailView>` — modal overlay subscribing to the interaction store
- `useIsTargeted(id)` — hook for interactables to render their own outline when targeted

---

## 8. Out of Scope for v1

- Multiplayer (architected for, not built)
- User accounts / sign-up
- User-uploaded assets (only owner uploads via Asset Studio)
- Drivable vehicles
- Game mechanics / progression
- Facial expressions / lipsync
- VRM avatar support (Mixamo only)
- Internationalization
- Save game state beyond localStorage
