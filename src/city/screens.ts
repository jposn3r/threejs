import * as THREE from 'three'
import { canvasTexture, FONT, linear, text } from '@/render/canvas'
import { fogUniforms, cel } from '@/render/materials'
import { time } from '@/render/time'
import type { SignSpec } from './building'

/**
 * City screens. Painted like real ads — gradients, product shapes, small
 * type — not glowing text. Original brands only (SPEC §2).
 */
type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void

/** Faint pixel rows + vignette so every ad reads as a display. */
function screenTexture(w: number, h: number, draw: Draw) {
  return canvasTexture(w, h, (g) => {
    draw(g, w, h)
    g.fillStyle = 'rgba(0,0,0,0.16)'
    for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1)
    const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75)
    v.addColorStop(0, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(0,0,0,0.45)')
    g.fillStyle = v
    g.fillRect(0, 0, w, h)
  })
}

const H = (draw: Draw) => () => screenTexture(768, 384, draw)
const V = (draw: Draw) => () => screenTexture(384, 768, draw)

const ADS: Record<string, () => THREE.CanvasTexture> = {
  vq: H((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, W, Hh, [[0, '#04201e'], [1, '#0a3a4a']])
    g.fillRect(0, 0, W, Hh)
    for (let i = 5; i >= 0; i--) {
      g.strokeStyle = `rgba(80,255,200,${0.12 + i * 0.1})`
      g.lineWidth = 6
      g.beginPath()
      g.arc(W * 0.78, Hh * 0.5, 30 + i * 22, 0, Math.PI * 2)
      g.stroke()
    }
    text(g, 'VISION QUEST', 44, Hh * 0.42, `700 70px ${FONT.display}`, '#e9fff8')
    text(g, 'THE FRONTIER, EXPLAINED · EVERY WEDNESDAY', 46, Hh * 0.62, `500 20px ${FONT.mono}`, '#6ff0c8')
  }),
  kaizen: H((g, W, Hh) => {
    g.fillStyle = '#e8b82a'
    g.fillRect(0, 0, W, Hh)
    g.fillStyle = '#1a1406'
    g.fillRect(14, 14, W - 28, Hh - 28)
    g.fillStyle = '#e8b82a'
    g.fillRect(22, 22, W - 44, Hh - 44)
    text(g, '改善', 60, Hh / 2, `700 150px ${FONT.jp}`, '#1a1406')
    text(g, 'KAIZEN', 400, Hh * 0.42, `700 84px ${FONT.display}`, '#1a1406')
    text(g, 'BETTER EVERY DAY', 404, Hh * 0.66, `600 28px ${FONT.display}`, '#1a1406')
  }),
  stream: H((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, W, Hh, [[0, '#120a2a'], [1, '#2a0f3a']])
    g.fillRect(0, 0, W, Hh)
    g.fillStyle = linear(g, 0, 0, W, 0, [[0, '#8a2a52'], [1, '#2a2a7a']])
    g.fillRect(30, 30, W - 60, 150)
    text(g, 'NOW STREAMING', 56, 106, `700 48px ${FONT.display}`, '#ffffff')
    const cols = ['#c24a6a', '#3a8ab0', '#c9a23a', '#6a4ab0', '#3ab08a']
    cols.forEach((c, i) => {
      g.fillStyle = c
      g.fillRect(30 + i * 144, 210, 128, 140)
    })
    g.strokeStyle = '#ffffff'
    g.lineWidth = 5
    g.strokeRect(172, 206, 136, 148)
  }),
  ronin: H((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, W, Hh, [[0, '#2a0612'], [1, '#12040c']])
    g.fillRect(0, 0, W, Hh)
    g.fillStyle = 'rgba(255,90,140,0.15)'
    g.beginPath()
    g.arc(160, Hh / 2, 150, 0, Math.PI * 2)
    g.fill()
    text(g, '浪', 160, Hh / 2 + 6, `700 210px ${FONT.jp}`, '#ffe6ee', { align: 'center' })
    text(g, 'RONIN VENTURES', 330, Hh * 0.42, `700 56px ${FONT.display}`, '#ffffff')
    text(g, 'SOFTWARE & EXPERIMENTS', 332, Hh * 0.62, `500 22px ${FONT.mono}`, '#ff8fb0')
  }),
  lumen: H((g, W, Hh) => {
    g.fillStyle = '#0c1026'
    g.fillRect(0, 0, W, Hh)
    g.strokeStyle = '#e8ecf6'
    g.lineWidth = 8
    g.strokeRect(30, 30, W - 60, Hh - 60)
    text(g, 'LUMEN', W / 2, Hh * 0.44, `700 110px ${FONT.display}`, '#e8ecf6', { align: 'center' })
    text(g, 'SAVINGS & LOANS', W / 2, Hh * 0.7, `500 26px ${FONT.mono}`, '#9fb0d8', { align: 'center' })
  }),
  noodle: H((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, 0, Hh, [[0, '#3a1206'], [1, '#1a0804']])
    g.fillRect(0, 0, W, Hh)
    text(g, '麺', 150, Hh / 2, `700 200px ${FONT.jp}`, '#ffcf86', { align: 'center' })
    text(g, 'NOODLE BAR', 300, Hh * 0.42, `700 72px ${FONT.display}`, '#ffe3b8')
    text(g, 'OPEN LATE · 24H', 302, Hh * 0.64, `500 24px ${FONT.mono}`, '#ffb65c')
  }),
  kibo: H((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, W, Hh, [[0, '#062a2a'], [1, '#0a1a30']])
    g.fillRect(0, 0, W, Hh)
    g.fillStyle = '#e8fff6'
    g.fillRect(70, 150, 90, 30)
    g.fillRect(100, 120, 30, 90)
    text(g, 'KIBO CLINIC', 210, Hh * 0.42, `700 64px ${FONT.display}`, '#e8fff6')
    text(g, 'WALK-INS WELCOME', 212, Hh * 0.62, `500 24px ${FONT.mono}`, '#6fd8c8')
  }),
  mirai: H((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, 0, Hh, [[0, '#2a1a5a'], [0.6, '#c2587a'], [1, '#f2a65a']])
    g.fillRect(0, 0, W, Hh)
    g.fillStyle = '#12081e'
    g.beginPath()
    g.moveTo(120, 300)
    g.lineTo(200, 240)
    g.lineTo(420, 228)
    g.lineTo(560, 262)
    g.lineTo(620, 300)
    g.closePath()
    g.fill()
    g.beginPath()
    g.arc(230, 304, 30, 0, Math.PI * 2)
    g.arc(540, 304, 30, 0, Math.PI * 2)
    g.fill()
    text(g, 'MIRAI MOTORS', 40, 70, `700 56px ${FONT.display}`, '#ffffff')
  }),
  v: V((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, 0, Hh, [[0, '#06162a'], [1, '#0a2a3a']])
    g.fillRect(0, 0, W, Hh)
    ;[...'メタカイゼン'].forEach((ch, i) => text(g, ch, W / 2, 80 + i * 110, `700 92px ${FONT.jp}`, '#bff4ff', { align: 'center' }))
  }),
  kana: V((g, W, Hh) => {
    g.fillStyle = linear(g, 0, 0, 0, Hh, [[0, '#1a0a30'], [1, '#0a0a24']])
    g.fillRect(0, 0, W, Hh)
    text(g, '未来', W / 2, Hh * 0.3, `700 150px ${FONT.jp}`, '#e8ecff', { align: 'center' })
    text(g, 'METAKAIZEN', W / 2, Hh * 0.62, `700 54px ${FONT.display}`, '#e8ecff', { align: 'center' })
    text(g, 'TOWER', W / 2, Hh * 0.72, `600 40px ${FONT.display}`, '#9fb0d8', { align: 'center' })
  }),
}

/** Horizontal ads handed out round-robin to 'h' slots. */
const ROTATION = ['vq', 'kaizen', 'stream', 'ronin', 'lumen', 'noodle', 'kibo', 'mirai']

function screenMaterial(map: THREE.Texture, seed: number, gain = 0.85) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    side: THREE.DoubleSide,
    uniforms: { ...fogUniforms(), map: { value: map }, uTime: time, uGain: { value: gain }, uSeed: { value: seed } },
    vertexShader: /* glsl */ `#include <fog_pars_vertex>
      varying vec2 vUv;
      void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `#include <fog_pars_fragment>
      uniform sampler2D map; uniform float uTime, uGain, uSeed; varying vec2 vUv;
      void main(){
        vec2 uv = vUv;
        // a rare, brief horizontal glitch; slow and whole-screen, so it never reads as shimmer
        float gl = step(0.996, fract(sin(floor(uTime * 7.0 + uSeed * 17.0)) * 43758.5453));
        uv.x += gl * 0.02 * sin(uv.y * 90.0);
        vec3 c = texture2D(map, uv).rgb;
        gl_FragColor = vec4(c * uGain * (0.97 + 0.03 * sin(uTime * 9.0 + uSeed)), 1.0);
        #include <fog_fragment>
      }`,
  })
}

/** Build every screen in the layout (plus a dark frame behind each). */
export function createScreens(signs: SignSpec[]) {
  const group = new THREE.Group()
  const textures = new Map<string, THREE.CanvasTexture>()
  const materials = new Map<string, THREE.ShaderMaterial>()
  const frame = cel('#0c1030')
  let next = 0
  for (const s of signs) {
    const key = s.ad === 'h' ? ROTATION[next++ % ROTATION.length] : s.ad
    if (!ADS[key]) continue
    if (!textures.has(key)) textures.set(key, ADS[key]())
    if (!materials.has(key)) materials.set(key, screenMaterial(textures.get(key)!, materials.size))
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), materials.get(key)!)
    m.position.set(s.x, s.y, s.z)
    m.rotation.y = s.ry
    const f = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.6, s.h + 0.6, 0.3), frame)
    f.position.copy(m.position)
    f.rotation.y = s.ry
    f.translateZ(-0.2)
    group.add(m, f)
  }
  return group
}
