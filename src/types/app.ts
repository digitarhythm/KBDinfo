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
