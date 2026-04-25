import type { KleKeyboard } from '../types/kle'
import type {
  EncoderConfig,
  InfoJson,
  LayoutKey,
  RgbMatrixConfig,
  RgbMatrixDefault,
  RotaryEncoder,
  SplitConfig,
  Ws2812Config,
} from '../types/qmk'
import type {
  MetadataFormState,
  RgbMatrixFormState,
  RotaryEncoderForm,
  SplitFormState,
} from '../types/app'

const splitCsv = (s: string): string[] =>
  s.split(/[,\s]+/).map((x) => x.trim()).filter((x) => x.length > 0)

const filterTruthy = <T extends object>(o: T): Partial<T> => {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    if (v) out[k] = v
  }
  return out as Partial<T>
}

export const seedFromKle = (kb: KleKeyboard): Partial<MetadataFormState> => {
  const meta = kb.meta
  return {
    keyboard_name: meta.name?.trim() ?? '',
    maintainer: meta.author?.trim() || 'qmk',
    notesFromKle: meta.notes ?? '',
  }
}

export const buildInfoJson = (
  form: MetadataFormState,
  layout: LayoutKey[],
  layoutName: string = 'LAYOUT',
): InfoJson => {
  const info: InfoJson = {
    keyboard_name: form.keyboard_name,
    maintainer: form.maintainer,
    layouts: {
      [layoutName]: { layout },
    },
  }

  if (form.manufacturer) info.manufacturer = form.manufacturer
  if (form.url) info.url = form.url
  if (form.usb.vid || form.usb.pid || form.usb.device_version) {
    info.usb = {
      vid: form.usb.vid,
      pid: form.usb.pid,
      device_version: form.usb.device_version,
    }
  }

  const features = filterTruthy(form.features)
  if (Object.keys(features).length > 0) info.features = features

  const rows = splitCsv(form.matrix_pins.rows)
  const cols = splitCsv(form.matrix_pins.cols)
  if (rows.length > 0 || cols.length > 0) {
    info.matrix_pins = { rows, cols }
    info.diode_direction = form.diode_direction
  }

  const encoder = buildEncoder(form.encoder_rotary)
  if (encoder) info.encoder = encoder

  const debounceNum = Number(form.debounce)
  if (form.debounce !== '' && Number.isFinite(debounceNum) && debounceNum >= 0) {
    info.debounce = debounceNum
  }

  const rgb = buildRgbMatrix(form.rgb_matrix)
  if (rgb) {
    info.rgb_matrix = rgb.config
    if (rgb.ws2812) info.ws2812 = rgb.ws2812
    if (info.features) {
      info.features = { ...info.features, rgb_matrix: true }
    } else {
      info.features = { rgb_matrix: true }
    }
  }

  const split = buildSplit(form.split)
  if (split) info.split = split

  if (form.processor) info.processor = form.processor
  if (form.bootloader) info.bootloader = form.bootloader

  return info
}

const numOrUndef = (s: string, opts?: { min?: number; max?: number }): number | undefined => {
  if (s === '') return undefined
  const n = Number(s)
  if (!Number.isFinite(n)) return undefined
  if (opts?.min !== undefined && n < opts.min) return undefined
  if (opts?.max !== undefined && n > opts.max) return undefined
  return n
}

const buildRgbMatrixDefault = (s: RgbMatrixFormState): RgbMatrixDefault | undefined => {
  const out: RgbMatrixDefault = {}
  if (s.default_animation) out.animation = s.default_animation
  const hue = numOrUndef(s.default_hue, { min: 0, max: 255 })
  if (hue !== undefined) out.hue = hue
  const sat = numOrUndef(s.default_sat, { min: 0, max: 255 })
  if (sat !== undefined) out.sat = sat
  const val = numOrUndef(s.default_val, { min: 0, max: 255 })
  if (val !== undefined) out.val = val
  const speed = numOrUndef(s.default_speed, { min: 0, max: 255 })
  if (speed !== undefined) out.speed = speed
  return Object.keys(out).length > 0 ? out : undefined
}

interface BuildRgbResult {
  config: RgbMatrixConfig
  ws2812?: Ws2812Config
}

const buildRgbMatrix = (s: RgbMatrixFormState): BuildRgbResult | null => {
  if (!s.enabled) return null

  const config: RgbMatrixConfig = { driver: s.driver || 'ws2812' }

  const ledCount = numOrUndef(s.led_count, { min: 1 })
  if (ledCount !== undefined) config.led_count = ledCount

  const maxBri = numOrUndef(s.max_brightness, { min: 0, max: 255 })
  if (maxBri !== undefined) config.max_brightness = maxBri

  if (s.sleep) config.sleep = true

  const timeout = numOrUndef(s.timeout, { min: 0 })
  if (timeout !== undefined) config.timeout = timeout

  const hueSteps = numOrUndef(s.hue_steps, { min: 1 })
  if (hueSteps !== undefined) config.hue_steps = hueSteps
  const satSteps = numOrUndef(s.sat_steps, { min: 1 })
  if (satSteps !== undefined) config.sat_steps = satSteps
  const valSteps = numOrUndef(s.val_steps, { min: 1 })
  if (valSteps !== undefined) config.val_steps = valSteps
  const speedSteps = numOrUndef(s.speed_steps, { min: 1 })
  if (speedSteps !== undefined) config.speed_steps = speedSteps

  const enabledAnims = Object.entries(s.animations)
    .filter(([, v]) => v === true)
    .reduce<Record<string, boolean>>((acc, [k]) => {
      acc[k] = true
      return acc
    }, {})
  if (Object.keys(enabledAnims).length > 0) config.animations = enabledAnims

  const def = buildRgbMatrixDefault(s)
  if (def) config.default = def

  const splitL = numOrUndef(s.split_count_left, { min: 0 })
  const splitR = numOrUndef(s.split_count_right, { min: 0 })
  if (splitL !== undefined && splitR !== undefined) {
    config.split_count = [splitL, splitR]
  }

  let ws2812: Ws2812Config | undefined
  if ((s.driver || 'ws2812') === 'ws2812' && s.ws2812_pin.trim()) {
    ws2812 = { pin: s.ws2812_pin.trim() }
  }

  return { config, ws2812 }
}

const buildRotaryList = (forms: RotaryEncoderForm[]): RotaryEncoder[] => {
  const out: RotaryEncoder[] = []
  for (const f of forms) {
    const a = f.pin_a.trim()
    const b = f.pin_b.trim()
    if (!a || !b) continue
    const r: RotaryEncoder = { pin_a: a, pin_b: b }
    const res = Number(f.resolution)
    if (f.resolution !== '' && Number.isFinite(res) && res > 0) r.resolution = res
    out.push(r)
  }
  return out
}

const buildEncoder = (forms: RotaryEncoderForm[]): EncoderConfig | null => {
  const rotary = buildRotaryList(forms)
  return rotary.length > 0 ? { rotary } : null
}

const parseMatrixPair = (s: string): [number, number] | null => {
  const m = /^(\d+)\s*,\s*(\d+)$/.exec(s.trim())
  return m ? [Number(m[1]), Number(m[2])] : null
}

const buildSplit = (s: SplitFormState): SplitConfig | null => {
  const out: SplitConfig = {}

  if (s.enabled) out.enabled = true

  const mx = parseMatrixPair(s.bootmagic_matrix)
  if (mx) out.bootmagic = { matrix: mx }

  if (s.handedness_pin.trim()) {
    out.handedness = { pin: s.handedness_pin.trim() }
  }

  const rightRows = splitCsv(s.matrix_pins_right_rows)
  const rightCols = splitCsv(s.matrix_pins_right_cols)
  if (rightRows.length > 0 || rightCols.length > 0) {
    out.matrix_pins = { right: {} }
    if (rightRows.length > 0) out.matrix_pins.right!.rows = rightRows
    if (rightCols.length > 0) out.matrix_pins.right!.cols = rightCols
  }

  if (s.serial_pin.trim()) {
    out.serial = {
      driver: s.serial_driver || 'vendor',
      pin: s.serial_pin.trim(),
    }
  }

  const rightRotary = buildRotaryList(s.encoder_right_rotary)
  if (rightRotary.length > 0) {
    out.encoder = { right: { rotary: rightRotary } }
  }

  return Object.keys(out).length > 0 ? out : null
}
