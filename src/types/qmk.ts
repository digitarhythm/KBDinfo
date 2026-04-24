export type MatrixCoord = [row: number, col: number]

export interface LayoutKey {
  label?: string
  matrix: MatrixCoord
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
