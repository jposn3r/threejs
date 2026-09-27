# Metakaizen

An anime megacity you can walk through, in the browser, on desktop and mobile. Ride the Metakaizen Line to **Central Station** — Jake Posner's career district — with more stations (Garage, Armory, Lab) to come.

See [SPEC.md](SPEC.md) for the story, look, architecture and build order.

## Stack

Vite · React · TypeScript · React Three Fiber · Rapier · three-vrm · zustand · Tailwind · Cloudflare Workers (static assets)

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:5173 (deep links: `/#career`, `/#visionquest`) |
| `npm run check` | Typecheck + unit tests |
| `npm run build` | Production build to `dist/` |
| `npx wrangler deploy` | Deploy `dist/` (wrangler is pinned to 4.30.0 on purpose — see SPEC §3 row 14) |

## Where things live

| Path | |
|---|---|
| `src/content/` | Career copy, Vision Quest editions, line stations — **edit text here** |
| `src/zones/central/` | Station layout (data), station builder, panels |
| `src/city/` | Procedural city: parts kit, buildings, canal layout, screens, water, atmosphere |
| `src/render/` | Cel/rim materials, window shaders, sky, post stack, quality tiers |
| `src/player/` | Traveler controller, VRM avatar + procedural animation, camera |
| `src/input/`, `src/interaction/` | Keyboard / mouse / touch input, proximity prompts, tap-to-walk routing |

## Controls

- **Desktop:** WASD / arrows move · Shift run · drag to look · click to walk there · scroll to zoom · E interact · P transit pass · H photo mode
- **Touch:** left thumb joystick · drag to look · tap to walk · tap a landmark to walk there and open it

## Credits

Temporary traveler: `VRM1_Constraint_Twist_Sample` by pixiv Inc. (VRM Public License 1.0: redistribution, modification and commercial use allowed; credit not required). City, station and signage are generated in code.
