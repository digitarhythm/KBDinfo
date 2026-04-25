import { describe, expect, it } from 'vitest'
import { kleToInfoJson } from '../src/converter'
import { defaultMetadataForm } from '../src/types/app'

const rawKle = '[["0,0"]]'

describe('RGB Matrix 設定', () => {
  it('enabled が false のときは出力されない', () => {
    const { info } = kleToInfoJson(rawKle, defaultMetadataForm())
    expect(info.rgb_matrix).toBeUndefined()
    expect(info.ws2812).toBeUndefined()
    expect(info.features?.rgb_matrix).toBeUndefined()
  })

  it('enabled にすると driver と features.rgb_matrix が必ず出る', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.rgb_matrix?.driver).toBe('ws2812')
    expect(info.features?.rgb_matrix).toBe(true)
  })

  it('ws2812 driver の場合は ws2812.pin を別オブジェクトで出す', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.driver = 'ws2812'
    form.rgb_matrix.ws2812_pin = 'GP1'
    form.rgb_matrix.led_count = '87'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.ws2812).toEqual({ pin: 'GP1' })
    expect(info.rgb_matrix?.led_count).toBe(87)
  })

  it('ws2812 以外のドライバーでは ws2812 オブジェクトは出ない', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.driver = 'is31fl3733'
    form.rgb_matrix.ws2812_pin = 'GP1' // 残ってても無視
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.ws2812).toBeUndefined()
  })

  it('animations は true のものだけ出力', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.animations = {
      breathing: true,
      cycle_all: true,
      band_sat: false,
      raindrops: true,
    }
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.rgb_matrix?.animations).toEqual({
      breathing: true,
      cycle_all: true,
      raindrops: true,
    })
  })

  it('default は埋まった項目だけ集約して出力', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.default_animation = 'cycle_left_right'
    form.rgb_matrix.default_val = '200'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.rgb_matrix?.default).toEqual({
      animation: 'cycle_left_right',
      val: 200,
    })
  })

  it('split_count は left/right 両方そろっている時のみ出る', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.split_count_left = '44'
    form.rgb_matrix.split_count_right = '43'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.rgb_matrix?.split_count).toEqual([44, 43])
  })

  it('split_count は片方だけだと出さない', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.split_count_left = '44'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.rgb_matrix?.split_count).toBeUndefined()
  })

  it('範囲外の数値は無視（hue=300 → 出さない）', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.default_hue = '300'
    const { info } = kleToInfoJson(rawKle, form)
    expect(info.rgb_matrix?.default).toBeUndefined()
  })

  it('JSONキー順 rgb_matrix → ws2812 → split', () => {
    const form = defaultMetadataForm()
    form.rgb_matrix.enabled = true
    form.rgb_matrix.ws2812_pin = 'GP1'
    form.split.enabled = true
    const { json } = kleToInfoJson(rawKle, form)
    const idxRgb = json.indexOf('"rgb_matrix"')
    const idxWs = json.indexOf('"ws2812"')
    const idxSplit = json.indexOf('"split"')
    expect(idxRgb).toBeGreaterThan(-1)
    expect(idxWs).toBeGreaterThan(idxRgb)
    expect(idxSplit).toBeGreaterThan(idxWs)
  })
})
