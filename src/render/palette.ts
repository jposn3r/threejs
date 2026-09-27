import { Color } from 'three'

/**
 * The Metakaizen night palette. Everything sits in blue-violet; colour comes
 * only from light sources (windows, screens, a few thin accents). See SPEC §2.
 */
export const PAL = {
  sky0: '#03061a',
  sky1: '#0a1450',
  sky2: '#1f2d8c',
  fog: '#0f1650',
  facade: '#151b45',
  concrete: '#262d5c',
  metal: '#20254d',
  trim: '#2f356a',
  cyan: '#3ff2ff',
  magenta: '#ff3fa4',
  yellow: '#fcee0a',
  lime: '#b8ff3c',
  mint: '#3dffc0',
  warm: '#ffc861',
  violet: '#8a5cff',
  red: '#ff3048',
  white: '#dff1ff',
} as const

/** A colour with its linear value scaled — values above 1 feed the bloom pass. */
export function hdr(hex: string, k = 1): Color {
  return new Color(hex).multiplyScalar(k)
}
