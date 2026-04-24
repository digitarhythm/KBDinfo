export type MatrixCoord = [row: number, col: number]

/**
 * matrix の出力値。常に配列としてシリアライズされる。
 * - KLE ラベルが `row,col` 形式の2数値 → `[row, col]`
 * - カンマ区切りで複数の数値 → `[n, n, ...]`
 * - それ以外（例: `"5.6"`, `"Esc"`）→ 単一要素の配列 `[raw_text]`
 *   （数値と解釈可能なら数値のまま、そうでなければ文字列要素）
 */
export type MatrixValue = Array<number | string>

export interface LayoutKey {
  label?: string
  matrix: MatrixValue
  x: number
  y: number
  w?: number
  h?: number
  r?: number
  rx?: number
  ry?: number
}

export interface LayoutVariant {
  layout: LayoutKey[]
}

export interface UsbSpec {
  vid: string
  pid: string
  device_version: string
}

export interface MatrixPins {
  rows: string[]
  cols: string[]
}

export type DiodeDirection = 'COL2ROW' | 'ROW2COL'

export interface Features {
  bootmagic?: boolean
  mousekey?: boolean
  extrakey?: boolean
  console?: boolean
  command?: boolean
  nkro?: boolean
  backlight?: boolean
  rgblight?: boolean
  audio?: boolean
}

export interface SplitBootmagic {
  matrix: [row: number, col: number]
}

export interface SplitHandedness {
  pin: string
}

export interface SplitMatrixPinsSide {
  rows?: string[]
  cols?: string[]
}

export interface SplitMatrixPins {
  right?: SplitMatrixPinsSide
  left?: SplitMatrixPinsSide
}

export interface SplitSerial {
  driver: string
  pin: string
}

export interface SplitConfig {
  enabled?: boolean
  bootmagic?: SplitBootmagic
  handedness?: SplitHandedness
  matrix_pins?: SplitMatrixPins
  serial?: SplitSerial
}

export interface InfoJson {
  keyboard_name: string
  manufacturer?: string
  maintainer: string
  url?: string
  usb?: UsbSpec
  features?: Features
  matrix_pins?: MatrixPins
  diode_direction?: DiodeDirection
  debounce?: number
  split?: SplitConfig
  processor?: string
  bootloader?: string
  layouts: {
    [key: string]: LayoutVariant
  }
}
