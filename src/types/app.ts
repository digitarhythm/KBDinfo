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

export interface RotaryEncoderForm {
  pin_a: string
  pin_b: string
  resolution: string
}

export const emptyEncoder = (): RotaryEncoderForm => ({
  pin_a: '',
  pin_b: '',
  resolution: '',
})

export interface RgbMatrixFormState {
  enabled: boolean
  driver: string
  led_count: string
  ws2812_pin: string
  max_brightness: string
  sleep: boolean
  timeout: string
  hue_steps: string
  sat_steps: string
  val_steps: string
  speed_steps: string
  animations: Record<string, boolean>
  default_animation: string
  default_hue: string
  default_sat: string
  default_val: string
  default_speed: string
  split_count_left: string
  split_count_right: string
}

export interface SplitFormState {
  enabled: boolean
  bootmagic_matrix: string
  handedness_pin: string
  matrix_pins_right_rows: string
  matrix_pins_right_cols: string
  serial_driver: string
  serial_pin: string
  encoder_right_rotary: RotaryEncoderForm[]
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
  encoder_rotary: RotaryEncoderForm[]
  debounce: string
  rgb_matrix: RgbMatrixFormState
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
  encoder_rotary: [],
  debounce: '',
  rgb_matrix: {
    enabled: false,
    driver: 'ws2812',
    led_count: '',
    ws2812_pin: '',
    max_brightness: '',
    sleep: false,
    timeout: '',
    hue_steps: '',
    sat_steps: '',
    val_steps: '',
    speed_steps: '',
    animations: {},
    default_animation: '',
    default_hue: '',
    default_sat: '',
    default_val: '',
    default_speed: '',
    split_count_left: '',
    split_count_right: '',
  },
  split: {
    enabled: false,
    bootmagic_matrix: '',
    handedness_pin: '',
    matrix_pins_right_rows: '',
    matrix_pins_right_cols: '',
    serial_driver: 'vendor',
    serial_pin: '',
    encoder_right_rotary: [],
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
