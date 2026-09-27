import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/**
 * Parts kit. Buildings and megastructures are assembled from transformed
 * unit boxes/cylinders sorted into three bins, then merged into one mesh per
 * bin — the whole city costs three draw calls.
 *
 *  - facade: gets procedural windows; carries a per-building `aSeed`
 *  - trim:   plain cel-shaded parts (podiums, ledges, fins, roof clutter)
 *  - glow:   unlit light sources with per-vertex colour (shop signs, lamps)
 */
export type Bin = 'facade' | 'trim' | 'glow'

export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)
export const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1).translate(0, 0.5, 0)

export interface PartOptions {
  /** Building seed for facade windows. */
  seed?: number
  /** Glow colour (hex) and intensity multiplier. */
  color?: string
  k?: number
  /** Rotation about Y and Z, radians. */
  ry?: number
  rz?: number
}

const _m = new THREE.Matrix4()
const _q = new THREE.Quaternion()
const _p = new THREE.Vector3()
const _s = new THREE.Vector3()
const _e = new THREE.Euler()
const _c = new THREE.Color()

export class Kit {
  readonly bins: Record<Bin, THREE.BufferGeometry[]> = { facade: [], trim: [], glow: [] }

  /** Add a unit part scaled to (sx, sy, sz) with its base at (x, y, z). */
  part(bin: Bin, geo: THREE.BufferGeometry, x: number, y: number, z: number, sx: number, sy: number, sz: number, o: PartOptions = {}) {
    const g = geo.clone()
    g.applyMatrix4(_m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, o.ry ?? 0, o.rz ?? 0)), _s.set(sx, sy, sz)))
    const n = g.attributes.position.count
    if (bin === 'facade') g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(n).fill(o.seed ?? 0), 1))
    if (bin === 'glow') {
      _c.set(o.color ?? '#ffffff').multiplyScalar(o.k ?? 1)
      const a = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) {
        a[i * 3] = _c.r
        a[i * 3 + 1] = _c.g
        a[i * 3 + 2] = _c.b
      }
      g.setAttribute('color', new THREE.BufferAttribute(a, 3))
    }
    this.bins[bin].push(g)
  }

  count(bin?: Bin) {
    return bin ? this.bins[bin].length : this.bins.facade.length + this.bins.trim.length + this.bins.glow.length
  }

  /** Merge each bin into a single geometry. Source parts are disposed. */
  merge(): Record<Bin, THREE.BufferGeometry | null> {
    const out = {} as Record<Bin, THREE.BufferGeometry | null>
    for (const bin of ['facade', 'trim', 'glow'] as const) {
      const list = this.bins[bin]
      out[bin] = list.length ? mergeGeometries(list, false) : null
      for (const g of list) g.dispose()
      this.bins[bin] = []
    }
    return out
  }
}
