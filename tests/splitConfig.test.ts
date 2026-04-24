import { describe, expect, it } from 'vitest'
import { kleToInfoJson } from '../src/converter'
import { defaultMetadataForm } from '../src/types/app'

const rawKle = '[["0,0","0,1"]]'

describe('debounce / split 設定', () => {
  it('debounce 未指定なら info.json に含まれない', () => {
    const { info } = kleToInfoJson(rawKle, defaultMetadataForm())
    expect(info.debounce).toBeUndefined()
  })

  it('debounce を指定すると数値として出力される', () => {
    const form = defaultMetadataForm()
    form.debounce = '5'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.debounce).toBe(5)
  })

  it('debounce=0 も出力される', () => {
    const form = defaultMetadataForm()
    form.debounce = '0'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.debounce).toBe(0)
  })

  it('split.enabled=true だけでも split オブジェクトが出る', () => {
    const form = defaultMetadataForm()
    form.split.enabled = true
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.split).toEqual({ enabled: true })
  })

  it('split の全項目を埋めると完全な split オブジェクトが出る', () => {
    const form = defaultMetadataForm()
    form.split.enabled = true
    form.split.bootmagic_matrix = '4, 5'
    form.split.handedness_pin = 'GP20'
    form.split.matrix_pins_right_rows = 'GP4, GP5, GP6, GP7'
    form.split.matrix_pins_right_cols = 'GP0 GP1 GP2'
    form.split.serial_driver = 'vendor'
    form.split.serial_pin = 'GP1'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.split).toEqual({
      enabled: true,
      bootmagic: { matrix: [4, 5] },
      handedness: { pin: 'GP20' },
      matrix_pins: {
        right: {
          rows: ['GP4', 'GP5', 'GP6', 'GP7'],
          cols: ['GP0', 'GP1', 'GP2'],
        },
      },
      serial: { driver: 'vendor', pin: 'GP1' },
    })
  })

  it('bootmagic.matrix が不正形式なら bootmagic は出力しない', () => {
    const form = defaultMetadataForm()
    form.split.bootmagic_matrix = 'invalid'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.split).toBeUndefined()
  })

  it('split の部分指定：pin だけ埋める', () => {
    const form = defaultMetadataForm()
    form.split.serial_pin = 'GP1'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.split).toEqual({
      serial: { driver: 'vendor', pin: 'GP1' },
    })
  })

  it('出力JSON整形でも debounce/split が適切な位置に入る', () => {
    const form = defaultMetadataForm()
    form.debounce = '5'
    form.split.enabled = true
    const { json } = kleToInfoJson(rawKle, form)
    // diode_direction は matrix_pins 未指定で出ないので、
    // matrix_pins も未指定なら debounce と split の前にあるのは features/layouts 以外のフィールド
    const debounceIdx = json.indexOf('"debounce"')
    const splitIdx = json.indexOf('"split"')
    const layoutsIdx = json.indexOf('"layouts"')
    expect(debounceIdx).toBeGreaterThan(-1)
    expect(splitIdx).toBeGreaterThan(debounceIdx)
    expect(layoutsIdx).toBeGreaterThan(splitIdx)
  })
})
