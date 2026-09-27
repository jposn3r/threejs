import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mulberry32 } from '@/lib/rng'
import { canvasTexture, FONT, radialTexture, text, textPlane } from '@/render/canvas'
import { cel, glow } from '@/render/materials'
import { PAL, hdr } from '@/render/palette'
import { time } from '@/render/time'
import { stations } from '@/content/stations'
import { BENCHES, FLOORS, GATE, KIOSK, PILLARS, PLATFORM, RAILINGS, ROUTE_MAP, SCREEN_DOOR_Z, TOWER, TRACK_Z, type Railing } from './layout'

/**
 * Central Station: platform, screen doors, canopy, signs, departure board,
 * route map, transit-pass kiosk, benches, the Career District gate, the
 * Vision Quest broadcast tower, and the maglev.
 */
export function buildStation() {
  const group = new THREE.Group()
  group.name = 'central-station'
  const hitTargets: { object: THREE.Object3D; id: string }[] = []
  const floors: THREE.Object3D[] = []
  const updates: ((t: number, dt: number) => void)[] = []
  const rng = mulberry32(88)
  const add = (...o: THREE.Object3D[]) => group.add(...o)

  const lightPool = (x: number, z: number, radius: number, hex: string, k: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2, radius * 2),
      new THREE.MeshBasicMaterial({ map: radialTexture(), color: hdr(hex, k), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    m.rotation.x = -Math.PI / 2
    m.position.set(x, 0.02, z)
    add(m)
  }

  // ---------- floors ----------
  const floorTex = canvasTexture(512, 512, (g) => {
    g.fillStyle = '#1a1f44'
    g.fillRect(0, 0, 512, 512)
    const r = mulberry32(4)
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        g.fillStyle = `hsl(${228 + r() * 10} 26% ${21 + r() * 4}%)`
        g.fillRect(x * 128 + 3, y * 128 + 3, 122, 122)
      }
  })
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
  for (const f of FLOORS) {
    const w = f.x1 - f.x0
    const d = f.z1 - f.z0
    const tex = floorTex.clone()
    tex.repeat.set(w / 4, d / 4)
    tex.needsUpdate = true
    const top = new THREE.Mesh(new THREE.PlaneGeometry(w, d), cel('#ffffff', { map: tex }))
    top.rotation.x = -Math.PI / 2
    top.position.set((f.x0 + f.x1) / 2, 0, (f.z0 + f.z1) / 2)
    const th = f === PLATFORM ? 1.2 : 0.8
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, th, d), cel(PAL.concrete))
    body.position.set((f.x0 + f.x1) / 2, -th / 2 - 0.01, (f.z0 + f.z1) / 2)
    add(top, body)
    floors.push(top)
  }
  const yellowLine = new THREE.Mesh(new THREE.BoxGeometry(PLATFORM.x1 - PLATFORM.x0, 0.02, 0.35), cel('#d8c400'))
  yellowLine.position.set(0, 0.012, 4.35)
  const edgeGlow = new THREE.Mesh(new THREE.BoxGeometry(PLATFORM.x1 - PLATFORM.x0, 0.05, 0.08), glow(PAL.cyan, 0.8))
  edgeGlow.position.set(0, -1.2, PLATFORM.z0 - 0.02)
  add(yellowLine, edgeGlow)

  // ---------- railings ----------
  const railGlass = new THREE.MeshBasicMaterial({ color: hdr('#8fdcff', 0.5), transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })
  const railTop = cel(PAL.trim, { rim: 0.6 })
  const railPost = cel(PAL.trim)
  const railGlow = new Map<string, THREE.Material>()
  const railing = (s: Railing) => {
    const len = Math.hypot(s.x1 - s.x0, s.z1 - s.z0)
    const ang = Math.atan2(s.z1 - s.z0, s.x1 - s.x0)
    const cx = (s.x0 + s.x1) / 2
    const cz = (s.z0 + s.z1) / 2
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.05), railGlass)
    glass.position.set(cx, 0.55, cz)
    glass.rotation.y = -ang
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.12), railTop)
    rail.position.set(cx, 1.1, cz)
    rail.rotation.y = -ang
    if (!railGlow.has(s.glow)) railGlow.set(s.glow, glow(s.glow, 0.7))
    const base = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.05), railGlow.get(s.glow)!)
    base.position.set(cx, 0.03, cz)
    base.rotation.y = -ang
    add(glass, rail, base)
    const n = Math.max(1, Math.round(len / 3))
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.1, 0.07), railPost)
      p.position.set(s.x0 + (s.x1 - s.x0) * t, 0.55, s.z0 + (s.z1 - s.z0) * t)
      add(p)
    }
  }
  RAILINGS.forEach(railing)

  // ---------- platform screen doors ----------
  {
    const post = cel(PAL.metal, { rim: 0.5 })
    const stripe = cel('#c9ae00')
    const glass = new THREE.MeshBasicMaterial({ color: hdr('#9fe8ff', 0.6), transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide })
    const indicator = glow(PAL.lime, 1.2)
    for (let x = PLATFORM.x0 + 1; x <= PLATFORM.x1 - 1; x += 3.2) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.7, 0.36), post)
      p.position.set(x, 1.35, SCREEN_DOOR_Z)
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.5, 0.38), stripe)
      s.position.set(x - 0.12, 1.35, SCREEN_DOOR_Z)
      add(p, s)
      if (x + 3.2 <= PLATFORM.x1 - 1) {
        const gp = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.45), glass)
        gp.position.set(x + 1.6, 1.25, SCREEN_DOOR_Z)
        const ind = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.02), indicator)
        ind.position.set(x + 1.6, 2.62, SCREEN_DOOR_Z - 0.2)
        add(gp, ind)
      }
    }
    const header = textPlane(PLATFORM.x1 - PLATFORM.x0 - 2, 0.42, (g, W, H) => {
      g.fillStyle = '#0b0f2c'
      g.fillRect(0, 0, W, H)
      g.textBaseline = 'middle'
      g.fillStyle = '#7fe6ff'
      g.font = `600 ${Math.round(H * 0.6)}px ${FONT.display}, ${FONT.jp}`
      const seg = 'CENTRAL 中央 · METAKAIZEN LINE · '
      for (let x = 10; x < W; x += g.measureText(seg).width) g.fillText(seg, x, H / 2)
    })
    header.texture.wrapS = THREE.RepeatWrapping
    header.texture.needsUpdate = true
    header.mesh.position.set(0, 2.9, SCREEN_DOOR_Z - 0.2)
    header.mesh.rotation.y = Math.PI
    add(header.mesh)
    updates.push((t) => {
      header.texture.offset.x = (t * 0.02) % 1
    })
  }

  // ---------- canopy, pillars, light strips, cables ----------
  {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(54, 0.5, 11.4), cel(PAL.trim))
    roof.position.set(0, 6.2, -0.5)
    const lip1 = new THREE.Mesh(new THREE.BoxGeometry(54, 0.05, 0.05), glow(PAL.magenta, 0.8))
    lip1.position.set(0, 5.93, -6.2)
    const lip2 = new THREE.Mesh(new THREE.BoxGeometry(54, 0.05, 0.05), glow(PAL.cyan, 0.8))
    lip2.position.set(0, 5.93, 5.2)
    add(roof, lip1, lip2)
    const strip = glow(PAL.white, 1.5)
    for (let x = -24; x <= 24; x += 6)
      for (const z of [-3.2, 1.2]) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.3), strip)
        s.position.set(x, 5.92, z)
        add(s)
        lightPool(x, z, 3.2, '#9fd4ff', 0.2)
      }
    const pillarMat = cel(PAL.metal, { rim: 0.5 })
    const pillarGlow = { neg: glow(PAL.magenta, 0.7), pos: glow(PAL.cyan, 0.7) }
    for (const [x, z] of PILLARS) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 5.95, 16), pillarMat)
      p.position.set(x, 2.97, z)
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 5, 0.03), z < 0 ? pillarGlow.neg : pillarGlow.pos)
      l.position.set(x, 2.8, z + (z < 0 ? 0.33 : -0.33))
      add(p, l)
    }
    const cableMat = cel('#0c0f26')
    for (let x = -24; x < 24; x += 12) {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 5.8, -5.9), new THREE.Vector3(x + 6, 4.9 - rng() * 0.5, -6.0), new THREE.Vector3(x + 12, 5.8, -5.9)])
      add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 5), cableMat))
    }
  }

  // ---------- hanging station signs ----------
  for (const x of [-14, 14]) {
    const draw = (g: CanvasRenderingContext2D, W: number, H: number) => {
      g.fillStyle = '#0b0f2c'
      g.fillRect(0, 0, W, H)
      g.fillStyle = PAL.yellow
      g.fillRect(0, H - 18, W, 18)
      g.beginPath()
      g.arc(120, H / 2 - 8, 70, 0, Math.PI * 2)
      g.fill()
      text(g, 'M1', 120, H / 2 - 4, `700 70px ${FONT.display}`, '#0b0f2c', { align: 'center' })
      text(g, '中央', 230, H / 2 - 40, `700 118px ${FONT.jp}`, '#ffffff')
      text(g, 'CENTRAL', 500, H / 2 - 40, `600 64px ${FONT.display}`, '#eaf4ff')
      text(g, 'CAREER DISTRICT ←   → VISION QUEST', 230, H / 2 + 70, `500 34px ${FONT.mono}`, '#9fb0d8')
    }
    for (const side of [1, -1]) {
      const s = textPlane(4.6, 1.15, draw)
      s.mesh.position.set(x + side * 0.03, 4.9, -0.5)
      s.mesh.rotation.y = (side * Math.PI) / 2
      add(s.mesh)
    }
    for (const dz of [-1.6, 1.6]) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), cel(PAL.trim))
      rod.position.set(x, 5.75, -0.5 + dz)
      add(rod)
    }
  }

  // ---------- departure board with a live clock ----------
  {
    const board = textPlane(5.2, 1.2, () => {}, { gain: 1.05, side: THREE.DoubleSide })
    board.mesh.position.set(0, 4.8, -0.5)
    add(board.mesh)
    const g = board.canvas.getContext('2d')!
    const rows = stations
      .filter((s) => s.id !== 'central')
      .map((s) => [s.name.toUpperCase(), s.blurb.toUpperCase(), 'SOON'])
      .concat([['CENTRAL LOOP', 'NOW BOARDING', '0 MIN']])
    let last = -1
    const draw = () => {
      const W = board.canvas.width
      const H = board.canvas.height
      g.fillStyle = '#07091c'
      g.fillRect(0, 0, W, H)
      g.font = `500 30px ${FONT.mono}`
      g.textBaseline = 'middle'
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      g.fillStyle = '#ffb347'
      g.fillText(`METAKAIZEN LINE        ${hh}${now.getSeconds() % 2 ? ':' : ' '}${mm}`, 24, 34)
      rows.forEach(([a, b, c], i) => {
        g.fillStyle = c === '0 MIN' ? PAL.lime : '#ffb347'
        g.fillText(a.padEnd(14, ' ') + b.padEnd(22, ' ') + c, 24, 88 + i * 42)
      })
      board.texture.needsUpdate = true
    }
    draw()
    updates.push(() => {
      const s = Math.floor(Date.now() / 1000)
      if (s !== last) {
        last = s
        draw()
      }
    })
  }

  // ---------- route map (interactive) ----------
  {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.3, 0.2), cel(PAL.metal, { rim: 0.5 }))
    stand.position.set(ROUTE_MAP.x, 1.45, ROUTE_MAP.z)
    const map = textPlane(3.5, 2.0, (g, W) => {
      g.fillStyle = '#10143a'
      g.fillRect(0, 0, W, 9999)
      text(g, 'METAKAIZEN LINE', 48, 70, `700 58px ${FONT.display}`, PAL.yellow)
      text(g, 'ROUTE MAP · 路線図', 50, 120, `500 26px ${FONT.mono}, ${FONT.jp}`, '#9fb0d8')
      g.strokeStyle = PAL.yellow
      g.lineWidth = 14
      g.beginPath()
      g.moveTo(90, 330)
      g.lineTo(W - 90, 330)
      g.stroke()
      stations.forEach((s, i) => {
        const x = 110 + i * ((W - 220) / (stations.length - 1))
        g.fillStyle = s.open ? PAL.yellow : '#10143a'
        g.strokeStyle = PAL.yellow
        g.lineWidth = 8
        g.beginPath()
        g.arc(x, 330, 26, 0, Math.PI * 2)
        g.fill()
        g.stroke()
        text(g, s.name.toUpperCase(), x, 410, `600 36px ${FONT.display}`, '#ffffff', { align: 'center' })
        text(g, s.open ? 'YOU ARE HERE' : 'OPENING SOON', x, 450, `500 22px ${FONT.mono}`, s.open ? PAL.lime : '#9fb0d8', { align: 'center' })
      })
    })
    map.mesh.position.set(ROUTE_MAP.x, 1.5, ROUTE_MAP.z + 0.12)
    add(stand, map.mesh)
    hitTargets.push({ object: map.mesh, id: 'line' }, { object: stand, id: 'line' })
  }

  // ---------- transit-pass kiosk (interactive) ----------
  {
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.3, 2.1, 0.8, 3, 0.08), cel('#2a1a4a', { rim: 0.7 }))
    body.position.set(KIOSK.x, 1.05, KIOSK.z)
    const scr = textPlane(1.0, 0.8, (g, W, H) => {
      g.fillStyle = '#1a0a2a'
      g.fillRect(0, 0, W, H)
      text(g, '乗車券', W / 2, H * 0.3, `700 170px ${FONT.jp}`, PAL.magenta, { align: 'center', blur: 6 })
      text(g, 'TRANSIT PASS', W / 2, H * 0.62, `700 96px ${FONT.display}`, '#ffffff', { align: 'center' })
      text(g, 'TAP TO VIEW STAMPS', W / 2, H * 0.84, `500 52px ${FONT.mono}`, PAL.cyan, { align: 'center' })
    })
    scr.mesh.position.set(KIOSK.x, 1.45, KIOSK.z + 0.41)
    add(body, scr.mesh)
    lightPool(KIOSK.x, -4.3, 1.8, PAL.magenta, 0.2)
    hitTargets.push({ object: body, id: 'pass' }, { object: scr.mesh, id: 'pass' })
  }

  // ---------- benches facing the skyline ----------
  for (const { x, z } of BENCHES) {
    const mat = cel(PAL.metal, { rim: 0.4 })
    const seat = new THREE.Mesh(new RoundedBoxGeometry(2.4, 0.12, 0.6, 2, 0.04), mat)
    seat.position.set(x, 0.48, z)
    const back = new THREE.Mesh(new RoundedBoxGeometry(2.4, 0.5, 0.08, 2, 0.03), mat)
    back.position.set(x, 0.8, z + 0.28)
    back.rotation.x = -0.15
    add(seat, back)
    for (const dx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, 0.5), cel('#0c0f26'))
      leg.position.set(x + dx * 1.05, 0.23, z)
      add(leg)
    }
  }

  // ---------- west: Career District gate ----------
  {
    const mat = cel(PAL.metal, { rim: 0.6 })
    const stripeMat = glow(PAL.yellow, 0.9)
    for (const dz of [-5, 5]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 10, 1.4), mat)
      p.position.set(GATE.x, 5, GATE.z + dz)
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 9, 0.06), stripeMat)
      s.position.set(GATE.x + 0.72, 5, GATE.z + dz - Math.sign(dz) * 0.5)
      add(p, s)
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 11.4), mat)
    beam.position.set(GATE.x, 10.6, GATE.z)
    const portal = new THREE.Mesh(
      new THREE.PlaneGeometry(8.6, 9.6),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: time },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `varying vec2 vUv; uniform float uTime;
          void main(){
            float e = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
            float lines = 0.5 + 0.5 * sin(vUv.y * 60.0 - uTime * 3.0);
            vec3 c = mix(vec3(1.0, 0.85, 0.1), vec3(1.0, 0.45, 0.2), vUv.y) * (0.35 + 0.35 * lines);
            gl_FragColor = vec4(c * 0.7, (0.08 + 0.07 * lines) * e);
          }`,
      }),
    )
    portal.position.set(GATE.x + 0.1, 4.8, GATE.z)
    portal.rotation.y = Math.PI / 2
    const sign = textPlane(11, 2.4, (g, W, H) => {
      text(g, 'CAREER DISTRICT', W / 2, H * 0.36, `700 140px ${FONT.display}`, PAL.yellow, { align: 'center', blur: 6 })
      text(g, 'JAKE POSNER · ENGINEERING & PRODUCT', W / 2, H * 0.78, `500 56px ${FONT.mono}`, '#eaf4ff', { align: 'center' })
    })
    sign.mesh.position.set(GATE.x + 0.9, 12.8, GATE.z)
    sign.mesh.rotation.y = Math.PI / 2
    const light = new THREE.PointLight('#ffd23a', 60, 22, 2)
    light.position.set(GATE.x + 4, 4, GATE.z)
    add(beam, portal, sign.mesh, light)
    lightPool(GATE.x + 4, GATE.z, 6, PAL.yellow, 0.18)
    hitTargets.push({ object: portal, id: 'career' })
  }

  // ---------- east: Vision Quest broadcast tower ----------
  {
    const mat = cel(PAL.metal, { rim: 0.6 })
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.2, 14, 24), mat)
    base.position.set(TOWER.x, 7, TOWER.z)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 2.4, 120, 16), mat)
    mast.position.set(TOWER.x, 74, TOWER.z)
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), glow(PAL.mint, 0.8))
    door.position.set(TOWER.x - 3.9, 1.6, TOWER.z)
    door.rotation.y = -Math.PI / 2 + 0.12
    add(base, mast, door)
    const rings = ([
      [9, PAL.mint, 1.5],
      [13, PAL.cyan, 1.2],
      [17, PAL.mint, 1.0],
    ] as const).map(([r, c, k]) => {
      const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.14, 8, 128), glow(c, k))
      t.position.set(TOWER.x, 42, TOWER.z)
      add(t)
      return t
    })
    updates.push((t) => {
      rings[0].rotation.set(t * 0.5, t * 0.35, 0)
      rings[1].rotation.set(Math.PI / 2 + Math.sin(t * 0.4) * 0.6, 0, t * 0.22)
      rings[2].rotation.set(Math.sin(t * 0.3) * 0.4, -t * 0.18, Math.cos(t * 0.33) * 0.5)
    })
    const baseRing = glow(PAL.mint, 0.8)
    for (let i = 0; i < 4; i++) {
      const tr = new THREE.Mesh(new THREE.TorusGeometry(3.5 - i * 0.2, 0.04, 6, 48), baseRing)
      tr.rotation.x = Math.PI / 2
      tr.position.set(TOWER.x, 3 + i * 3, TOWER.z)
      add(tr)
    }
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1400, 10, 1, true),
      new THREE.MeshBasicMaterial({ color: hdr(PAL.mint, 1.0), transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
    )
    beam.position.set(TOWER.x, 134 + 700, TOWER.z)
    const sign = textPlane(11, 2.4, (g, W, H) => {
      text(g, 'VISION QUEST', W / 2, H * 0.36, `700 140px ${FONT.display}`, PAL.mint, { align: 'center', blur: 6 })
      text(g, '放送局 · THE FRONTIER, EXPLAINED', W / 2, H * 0.78, `500 56px ${FONT.mono}, ${FONT.jp}`, '#eaf4ff', { align: 'center' })
    })
    sign.mesh.position.set(TOWER.x - 4.6, 17, TOWER.z)
    sign.mesh.rotation.y = -Math.PI / 2
    const light = new THREE.PointLight('#3dffc0', 70, 26, 2)
    light.position.set(TOWER.x - 8, 4, TOWER.z)
    add(beam, sign.mesh, light)
    lightPool(TOWER.x - 7, TOWER.z, 6, PAL.mint, 0.18)
    hitTargets.push({ object: base, id: 'visionquest' }, { object: door, id: 'visionquest' })
  }

  // coloured practical lights on the platform
  for (const [hex, x, z, k] of [
    ['#3ff2ff', -8, -3, 25],
    ['#ff3fa4', 18, -3, 30],
    ['#8a5cff', 4, 2, 18],
  ] as const) {
    const l = new THREE.PointLight(hex, k, 14, 2)
    l.position.set(x, 3.2, z)
    add(l)
  }

  // ---------- maglev guideway and train ----------
  {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2400, 1.6, 3.4), cel(PAL.concrete))
    beam.position.set(0, -1.3, TRACK_Z)
    const g1 = new THREE.Mesh(new THREE.BoxGeometry(2400, 0.05, 0.06), glow(PAL.cyan, 0.7))
    g1.position.set(0, -2.1, TRACK_Z - 1.72)
    const g2 = g1.clone()
    g2.position.z = TRACK_Z + 1.72
    add(beam, g1, g2)
    const colMat = cel(PAL.concrete)
    for (let x = -1100; x <= 1100; x += 70) {
      if (Math.abs(x) < 90) continue
      const col = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 200, 10), colMat)
      col.position.set(x, -102, TRACK_Z)
      add(col)
    }
  }
  const train = new THREE.Group()
  {
    const bodyMat = cel('#d7def5', { rim: 0.6 })
    const winTex = canvasTexture(512, 64, (g) => {
      g.fillStyle = '#0b0f2c'
      g.fillRect(0, 0, 512, 64)
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 3 ? '#ffe2a8' : '#bfefff'
        g.fillRect(i * 64 + 6, 8, 52, 48)
        g.fillStyle = 'rgba(11,15,44,.55)'
        if (i % 2) g.fillRect(i * 64 + 22, 26, 14, 30)
      }
    })
    const winMat = new THREE.MeshBasicMaterial({ map: winTex })
    const stripeMat = cel('#c9ae00')
    for (let i = 0; i < 3; i++) {
      const car = new THREE.Mesh(new RoundedBoxGeometry(18, 3.6, 3.2, 4, 0.7), bodyMat)
      car.position.set((i - 1) * 18.8, 1.7, 0)
      const w = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.1), winMat)
      w.position.set((i - 1) * 18.8, 2.2, -1.62)
      w.rotation.y = Math.PI
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.1, 3.24), stripeMat)
      stripe.position.set((i - 1) * 18.8, 0.9, 0)
      train.add(car, w, stripe)
    }
    const headlight = glow('#ffffff', 2.2)
    for (const sgn of [-1, 1]) {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), headlight)
      hl.position.set(sgn * 27.5, 1.2, 0)
      train.add(hl)
    }
    train.position.set(-900, 0, TRACK_Z)
    add(train)
  }
  // arrive, dwell, depart, gone — on a 34 s loop
  updates.push((t) => {
    const T = (t + 6) % 34
    let x: number
    if (T < 8) x = -700 * Math.pow(1 - T / 8, 2.2)
    else if (T < 17) x = 0
    else if (T < 25) x = 700 * Math.pow((T - 17) / 8, 2.2)
    else x = 900
    train.position.x = x
    train.visible = Math.abs(x) < 800
  })

  return {
    group,
    hitTargets,
    floors,
    update(t: number, dt: number) {
      for (const u of updates) u(t, dt)
    },
  }
}
