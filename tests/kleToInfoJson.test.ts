import { describe, expect, it } from 'vitest'
import { kleToInfoJson } from '../src/converter'
import { defaultMetadataForm } from '../src/types/app'

describe('kleToInfoJson 統合', () => {
  it('2×2 最小レイアウトを info.json に変換する', () => {
    const raw = JSON.stringify([
      { name: 'Tiny2x2' },
      ['0,0', '0,1'],
      ['1,0', '1,1'],
    ])
    const form = defaultMetadataForm()
    form.keyboard_name = 'Tiny2x2'
    form.manufacturer = 'Example'
    const { info, json } = kleToInfoJson(raw, form)

    expect(info.keyboard_name).toBe('Tiny2x2')
    expect(info.manufacturer).toBe('Example')
    expect(info.layouts.LAYOUT.layout).toHaveLength(4)
    expect(info.layouts.LAYOUT.layout[0]).toMatchObject({ matrix: [0, 0], x: 0, y: 0 })
    expect(info.layouts.LAYOUT.layout[3]).toMatchObject({ matrix: [1, 1], x: 1, y: 1 })

    expect(json).toContain('"keyboard_name": "Tiny2x2"')
    expect(json).toContain('"manufacturer": "Example"')
    expect(json.endsWith('\n')).toBe(true)
    expect(json).toMatch(/    "keyboard_name"/) // 4スペースインデント
  })

  it('無効なJSONで KleParseError を投げる', () => {
    expect(() => kleToInfoJson('not json', defaultMetadataForm())).toThrow()
  })

  it('matrix override が適用される', () => {
    const raw = JSON.stringify([['A', 'B']])
    const form = defaultMetadataForm()
    const { info } = kleToInfoJson(raw, form, { 0: [3, 4], 1: [3, 5] })
    expect(info.layouts.LAYOUT.layout[0].matrix).toEqual([3, 4])
    expect(info.layouts.LAYOUT.layout[1].matrix).toEqual([3, 5])
  })

  it('回転クラスタの r/rx/ry を出力する', () => {
    const raw = JSON.stringify([[{ r: 10, rx: 5, ry: 5 }, '0,0', '0,1']])
    const { info } = kleToInfoJson(raw, defaultMetadataForm())
    expect(info.layouts.LAYOUT.layout[0].r).toBe(10)
    expect(info.layouts.LAYOUT.layout[0].rx).toBe(5)
    expect(info.layouts.LAYOUT.layout[0].ry).toBe(5)
  })
})
