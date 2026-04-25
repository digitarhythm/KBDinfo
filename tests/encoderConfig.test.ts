import { describe, expect, it } from 'vitest'
import { kleToInfoJson } from '../src/converter'
import { defaultMetadataForm, emptyEncoder } from '../src/types/app'

const rawKle = '[["0,0"]]'

describe('rotary encoder 設定', () => {
  it('encoder_rotary が空なら encoder は出力されない', () => {
    const { info } = kleToInfoJson(rawKle, defaultMetadataForm())
    expect(info.encoder).toBeUndefined()
  })

  it('pin_a / pin_b 揃った行のみ出力される', () => {
    const form = defaultMetadataForm()
    form.encoder_rotary = [
      { pin_a: 'GP0', pin_b: 'GP1', resolution: '' },
      { pin_a: 'GP2', pin_b: '', resolution: '' }, // 不完全 → 無視
      { pin_a: 'GP4', pin_b: 'GP5', resolution: '4' },
    ]
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.encoder).toEqual({
      rotary: [
        { pin_a: 'GP0', pin_b: 'GP1' },
        { pin_a: 'GP4', pin_b: 'GP5', resolution: 4 },
      ],
    })
  })

  it('split.encoder.right.rotary も同様に出力', () => {
    const form = defaultMetadataForm()
    form.split.enabled = true
    form.split.encoder_right_rotary = [
      { pin_a: 'GP10', pin_b: 'GP11', resolution: '2' },
    ]
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.split?.encoder?.right?.rotary).toEqual([
      { pin_a: 'GP10', pin_b: 'GP11', resolution: 2 },
    ])
  })

  it('emptyEncoder ファクトリ', () => {
    const e = emptyEncoder()
    expect(e).toEqual({ pin_a: '', pin_b: '', resolution: '' })
  })

  it('JSONキー順で encoder は matrix_pins の後・debounce の前', () => {
    const form = defaultMetadataForm()
    form.matrix_pins.rows = 'F0'
    form.matrix_pins.cols = 'D0'
    form.encoder_rotary = [{ pin_a: 'GP0', pin_b: 'GP1', resolution: '' }]
    form.debounce = '5'
    const { json } = kleToInfoJson(rawKle, form)
    const idxMatrix = json.indexOf('"matrix_pins"')
    const idxEncoder = json.indexOf('"encoder"')
    const idxDebounce = json.indexOf('"debounce"')
    expect(idxMatrix).toBeGreaterThan(-1)
    expect(idxEncoder).toBeGreaterThan(idxMatrix)
    expect(idxDebounce).toBeGreaterThan(idxEncoder)
  })
})
