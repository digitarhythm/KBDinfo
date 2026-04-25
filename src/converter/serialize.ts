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
  'encoder',
  'debounce',
  'rgb_matrix',
  'ws2812',
  'split',
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

const INDENT_UNIT = '    '

const indent = (depth: number): string => INDENT_UNIT.repeat(depth)

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

// layout 要素（キー1つ分）は 1 行にまとめ、
// キー間のカンマ後だけスペースを入れ、ネストした配列 `[r,c]` は詰める。
// 出力例: `{"matrix":[0,1], "x":1.5, "y":1}`
const formatLayoutKey = (k: LayoutKey): string => {
  const ordered = orderObject(k, LAYOUT_KEY_ORDER)
  const parts = Object.entries(ordered)
    .filter(([, v]) => v !== undefined)
    .map(([key, val]) => `"${key}":${JSON.stringify(val)}`)
  return '{' + parts.join(', ') + '}'
}

const formatLayoutArray = (arr: LayoutKey[], depth: number): string => {
  if (arr.length === 0) return '[]'
  const lines = arr.map((item) => indent(depth + 1) + formatLayoutKey(item))
  return '[\n' + lines.join(',\n') + '\n' + indent(depth) + ']'
}

// 汎用整形: layouts.*.layout 配下の配列のみ 1 行コンパクト形式にする
const stringifyValue = (value: unknown, depth: number, parentKey: string): string => {
  if (value === null) return 'null'
  if (typeof value !== 'object') return JSON.stringify(value)

  if (Array.isArray(value)) {
    if (parentKey === 'layout') {
      return formatLayoutArray(value as LayoutKey[], depth)
    }
    if (value.length === 0) return '[]'
    const lines = value.map(
      (item) => indent(depth + 1) + stringifyValue(item, depth + 1, ''),
    )
    return '[\n' + lines.join(',\n') + '\n' + indent(depth) + ']'
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => v !== undefined,
  )
  if (entries.length === 0) return '{}'
  const lines = entries.map(([k, v]) => {
    return indent(depth + 1) + JSON.stringify(k) + ': ' + stringifyValue(v, depth + 1, k)
  })
  return '{\n' + lines.join(',\n') + '\n' + indent(depth) + '}'
}

export const serializeInfoJson = (info: InfoJson): string => {
  const orderedLayouts: Record<string, { layout: LayoutKey[] }> = {}
  for (const [name, variant] of Object.entries(info.layouts)) {
    orderedLayouts[name] = { layout: variant.layout }
  }
  const ordered = orderObject({ ...info, layouts: orderedLayouts }, KEY_ORDER)
  return stringifyValue(ordered, 0, '') + '\n'
}
