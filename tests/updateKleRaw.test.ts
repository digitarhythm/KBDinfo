import { describe, expect, it } from 'vitest'
import { updateKleRawLabels } from '../src/converter/updateKleRaw'

describe('updateKleRawLabels', () => {
  it('Download JSON 形式のラベルを原index指定で書き換え', () => {
    const raw = `[
      {"name": "T"},
      ["A", "B"],
      ["C", "D"]
    ]`
    const out = updateKleRawLabels(raw, new Map([[2, '1,0']]))
    // キー#2 は 2行目 ("C" → "1,0")
    expect(out).toContain('"1,0"')
    expect(out).toContain('"A"')
    expect(out).toContain('"B"')
    expect(out).toContain('"D"')
  })

  it('Raw data タブ形式（外側 [] 無し）を書き換えて同形式で返す', () => {
    const raw = `{name: "T"},
["A", "B"],
["C", "D"]`
    const out = updateKleRawLabels(raw, new Map([[0, '0,0'], [3, '1,1']]))
    // 外側 [] 無しの形式で返る
    expect(out.trim().startsWith('{')).toBe(true)
    expect(out).toContain('"0,0"')
    expect(out).toContain('"1,1"')
    expect(out).toContain('"B"')
    expect(out).toContain('"C"')
  })

  it('複数キーを一括書き換え', () => {
    const raw = '[["Esc", "Tab", "Q"]]'
    const out = updateKleRawLabels(
      raw,
      new Map([
        [0, '0,0'],
        [1, '0,1'],
        [2, '0,2'],
      ]),
    )
    expect(out).toContain('"0,0"')
    expect(out).toContain('"0,1"')
    expect(out).toContain('"0,2"')
    expect(out).not.toContain('"Esc"')
  })

  it('空 updates なら raw をそのまま返す', () => {
    const raw = '[["A","B"]]'
    const out = updateKleRawLabels(raw, new Map())
    expect(out).toBe(raw)
  })

  it('解析不能な入力で例外', () => {
    expect(() => updateKleRawLabels('garbage {{', new Map([[0, '0,0']]))).toThrow()
  })

  it('書き換え後のデータは parse → keyboard 化できる', async () => {
    const { parseKleRaw } = await import('../src/converter/parseKle')
    const raw = '[["5.6"], ["Esc"]]'
    const out = updateKleRawLabels(raw, new Map([[0, '0,0'], [1, '1,0']]))
    const kb = parseKleRaw(out)
    expect(kb.keys[0].labels[0]).toBe('0,0')
    expect(kb.keys[1].labels[0]).toBe('1,0')
  })

  it('プロパティオブジェクトと混在した行でも key index は string 要素のみでカウント', () => {
    // [{x:8},"K0",{x:2},"K1"] → index 0 = "K0", index 1 = "K1"
    const raw = '[[{"x":8},"K0",{"x":2},"K1"]]'
    const out = updateKleRawLabels(raw, new Map([[1, '0,1']]))
    expect(out).toContain('"K0"')
    expect(out).toContain('"0,1"')
    expect(out).not.toContain('"K1"')
  })
})
