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
  rgb_matrix?: boolean
  audio?: boolean
}

export interface Ws2812Config {
  pin: string
  driver?: string
}

export interface RgbMatrixDefault {
  animation?: string
  hue?: number
  sat?: number
  val?: number
  speed?: number
}

export type RgbMatrixAnimations = Record<string, boolean>

export interface RgbMatrixConfig {
  driver: string
  led_count?: number
  max_brightness?: number
  sleep?: boolean
  timeout?: number
  hue_steps?: number
  sat_steps?: number
  val_steps?: number
  speed_steps?: number
  animations?: RgbMatrixAnimations
  default?: RgbMatrixDefault
  split_count?: [number, number]
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

export interface RotaryEncoder {
  pin_a: string
  pin_b: string
  resolution?: number
}

export interface EncoderConfig {
  rotary: RotaryEncoder[]
}

export interface SplitEncoderSide {
  rotary: RotaryEncoder[]
}

export interface SplitEncoder {
  right?: SplitEncoderSide
  left?: SplitEncoderSide
}

export interface SplitConfig {
  enabled?: boolean
  bootmagic?: SplitBootmagic
  handedness?: SplitHandedness
  matrix_pins?: SplitMatrixPins
  serial?: SplitSerial
  encoder?: SplitEncoder
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
  encoder?: EncoderConfig
  debounce?: number
  rgb_matrix?: RgbMatrixConfig
  ws2812?: Ws2812Config
  split?: SplitConfig
  processor?: string
  bootloader?: string
  layouts: {
    [key: string]: LayoutVariant
  }
}
