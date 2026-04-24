import type { InfoJson, LayoutKey } from '../types/qmk'

const KEY_ORDER: Array<keyof InfoJson> = [
  'keyboard_name',
  'manufacturer',
  'maintainer',
  'url',
  'usb',
  'features',
  'matrix_pins',
  'diode_direction',
  'processor',
  'bootloader',
  'layouts',
]

const LAYOUT_KEY_ORDER: Array<keyof LayoutKey> = [
  'label',
  'matrix',
  'x',
  'y',
  'w',
  'h',
  'r',
  'rx',
  'ry',
]

const orderObject = <T extends object>(
  obj: T,
  order: ReadonlyArray<keyof T>,
): T => {
  const src = obj as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of order) {
    const key = k as string
    if (src[key] !== undefined) out[key] = src[key]
  }
  for (const key of Object.keys(src)) {
    if (!(key in out)) out[key] = src[key]
  }
  return out as T
}

export const serializeInfoJson = (info: InfoJson): string => {
  const layouts: Record<string, { layout: LayoutKey[] }> = {}
  for (const [name, variant] of Object.entries(info.layouts)) {
    layouts[name] = {
      layout: variant.layout.map((k) => orderObject(k, LAYOUT_KEY_ORDER)),
    }
  }
  const ordered = orderObject({ ...info, layouts }, KEY_ORDER)
  return JSON.stringify(ordered, null, 4) + '\n'
}
