import { computed, type ComputedRef, type Ref } from 'vue'
import type { KleKey } from '../types/kle'

export const KEY_UNIT_PX = 54
export const PAD_PX = 8

export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
  str: string
}

const rotatePoint = (x: number, y: number, cx: number, cy: number, angleDeg: number): { x: number; y: number } => {
  const rad = (angleDeg * Math.PI) / 180
  const s = Math.sin(rad)
  const c = Math.cos(rad)
  const dx = x - cx
  const dy = y - cy
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c }
}

const keyCorners = (k: KleKey): Array<{ x: number; y: number }> => {
  const pts = [
    { x: k.x, y: k.y },
    { x: k.x + k.width, y: k.y },
    { x: k.x + k.width, y: k.y + k.height },
    { x: k.x, y: k.y + k.height },
  ]
  if (k.rotation_angle === 0) return pts
  return pts.map((p) => rotatePoint(p.x, p.y, k.rotation_x, k.rotation_y, k.rotation_angle))
}

export const useViewBox = (keys: Ref<KleKey[] | undefined | null>): ComputedRef<ViewBox> => {
  return computed<ViewBox>(() => {
    if (!keys.value || keys.value.length === 0) {
      return { x: 0, y: 0, w: 300, h: 200, str: '0 0 300 200' }
    }
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    for (const k of keys.value) {
      for (const c of keyCorners(k)) {
        if (c.x < minX) minX = c.x
        if (c.y < minY) minY = c.y
        if (c.x > maxX) maxX = c.x
        if (c.y > maxY) maxY = c.y
      }
    }
    const x = minX * KEY_UNIT_PX - PAD_PX
    const y = minY * KEY_UNIT_PX - PAD_PX
    const w = (maxX - minX) * KEY_UNIT_PX + PAD_PX * 2
    const h = (maxY - minY) * KEY_UNIT_PX + PAD_PX * 2
    return { x, y, w, h, str: `${x} ${y} ${w} ${h}` }
  })
}

export const contrastTextColor = (hex: string | undefined): string => {
  if (!hex) return '#0f172a'
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0f172a'
  const v = parseInt(m[1], 16)
  const r = (v >> 16) & 0xff
  const g = (v >> 8) & 0xff
  const b = v & 0xff
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#0f172a' : '#f8fafc'
}
