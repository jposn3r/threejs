# Metakaizen

A web-first, video-game-style 3D experience showcasing 3D models — characters, vehicles, weapons, environments — across desktop, mobile, and VR.

**Live:** [metakaizen.com](https://metakaizen.com)
**Spec:** [SPEC.md](./SPEC.md) — single source of truth for v1
**Branch:** `reset` (full rebuild in progress)

## Stack

React Three Fiber · TypeScript · Tailwind · Rapier · Cloudflare R2/Pages

## Development

```bash
npm install
npm run dev
```

App runs on http://localhost:5173.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type-check only |
