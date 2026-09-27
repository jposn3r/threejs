import * as THREE from 'three'

/**
 * Canvas helpers for signage and small generated textures. Browser-only:
 * everything here touches `document`.
 */

export const FONT = {
  display: '"Chakra Petch", "Rajdhani", sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
  jp: '"Noto Sans JP", "Yu Gothic", "Hiragino Sans", sans-serif',
} as const

export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export function text(
  g: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  font: string,
  color: string,
  { align = 'left' as CanvasTextAlign, blur = 0 } = {},
) {
  g.font = font
  g.textAlign = align
  g.textBaseline = 'middle'
  g.fillStyle = color
  g.shadowColor = color
  g.shadowBlur = blur
  g.fillText(s, x, y)
  g.shadowBlur = 0
}

export function linear(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const gr = g.createLinearGradient(x0, y0, x1, y1)
  for (const [o, c] of stops) gr.addColorStop(o, c)
  return gr
}

let radial: THREE.CanvasTexture | null = null
/** Soft white radial falloff, used for light pools, blob shadows and motes. */
export function radialTexture() {
  radial ??= canvasTexture(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    r.addColorStop(0, 'rgba(255,255,255,0.9)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = r
    g.fillRect(0, 0, 128, 128)
  })
  return radial
}

/** A plane showing canvas-drawn content, e.g. station signs and boards. */
export function textPlane(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  { gain = 1, side = THREE.FrontSide as THREE.Side } = {},
) {
  const cw = 1024
  const ch = Math.round((1024 * h) / w)
  const tex = canvasTexture(cw, ch, draw)
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color('#ffffff').multiplyScalar(gain), transparent: true, side })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
  return { mesh, texture: tex, canvas: tex.image as HTMLCanvasElement }
}
