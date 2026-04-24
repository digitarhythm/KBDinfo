import type { MatrixCoord, DiodeDirection, Features } from './qmk'

export type WarningKind =
  | 'unparsed-label'
  | 'fallback-matrix'
  | 'dropped-secondary-rect'
  | 'dropped-meta-field'
  | 'duplicate-matrix'
  | 'parse-error'

export interface Warning {
  kind: WarningKind
  message: string
  keyIndex?: number
}

export interface SplitFormState {
  enabled: boolean
  bootmagic_matrix: string
  handedness_pin: string
  matrix_pins_right_rows: string
  matrix_pins_right_cols: string
  serial_driver: string
  serial_pin: string
}

export interface MetadataFormState {
  keyboard_name: string
  manufacturer: string
  maintainer: string
  url: string
  usb: {
    vid: string
    pid: string
    device_version: string
  }
  matrix_pins: {
    rows: string
    cols: string
  }
  diode_direction: DiodeDirection
  debounce: string
  split: SplitFormState
  processor: string
  bootloader: string
  features: Features
  notesFromKle: string
}

export interface SelectionState {
  selectedOriginalIndex: number | null
}

export type MatrixOverrides = Record<number, MatrixCoord>

export const defaultMetadataForm = (): MetadataFormState => ({
  keyboard_name: '',
  manufacturer: '',
  maintainer: 'qmk',
  url: '',
  usb: {
    vid: '0xFEED',
    pid: '0x0000',
    device_version: '0.0.1',
  },
  matrix_pins: {
    rows: '',
    cols: '',
  },
  diode_direction: 'COL2ROW',
  debounce: '',
  split: {
    enabled: false,
    bootmagic_matrix: '',
    handedness_pin: '',
    matrix_pins_right_rows: '',
    matrix_pins_right_cols: '',
    serial_driver: 'vendor',
    serial_pin: '',
  },
  processor: 'atmega32u4',
  bootloader: 'atmel-dfu',
  features: {
    bootmagic: true,
    mousekey: true,
    extrakey: true,
    console: false,
    command: false,
    nkro: false,
    backlight: false,
    rgblight: false,
    audio: false,
  },
  notesFromKle: '',
})
