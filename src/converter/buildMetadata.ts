import type { KleKeyboard } from '../types/kle'
import type { InfoJson, LayoutKey } from '../types/qmk'
import type { MetadataFormState } from '../types/app'

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

  if (form.processor) info.processor = form.processor
  if (form.bootloader) info.bootloader = form.bootloader

  return info
}
