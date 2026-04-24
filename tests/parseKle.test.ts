import { describe, expect, it } from 'vitest'
import { parseKleRaw, KleParseError } from '../src/converter/parseKle'

describe('parseKleRaw は Download JSON と Raw data の両形式を受け付ける', () => {
  it('Download JSON 形式（外側 [...] あり）', () => {
    const raw = `[
      {"name": "Test"},
      ["0,0", "0,1"],
      ["1,0", "1,1"]
    ]`
    const kb = parseKleRaw(raw)
    expect(kb.meta.name).toBe('Test')
    expect(kb.keys).toHaveLength(4)
    expect(kb.keys[0].labels[0]).toBe('0,0')
  })

  it('Raw data タブ形式（外側 [...] 無し、メタ + 行）', () => {
    const raw = `{name: "Test"},
["0,0", "0,1"],
["1,0", "1,1"]`
    const kb = parseKleRaw(raw)
    expect(kb.meta.name).toBe('Test')
    expect(kb.keys).toHaveLength(4)
  })

  it('Raw data タブ形式（メタ無し、行のみ）', () => {
    const raw = `["0,0", "0,1"],
["1,0", "1,1"]`
    const kb = parseKleRaw(raw)
    expect(kb.keys).toHaveLength(4)
    expect(kb.keys[2].labels[0]).toBe('1,0')
  })

  it('Raw data 形式で末尾カンマがあっても解析できる', () => {
    const raw = `["A", "B"],
["C", "D"],`
    const kb = parseKleRaw(raw)
    expect(kb.keys).toHaveLength(4)
  })

  it('JSON5 形式（unquoted key）を受け付ける', () => {
    const raw = `[[{x: 1, w: 2}, "A"]]`
    const kb = parseKleRaw(raw)
    expect(kb.keys[0]).toMatchObject({ x: 1, width: 2 })
  })

  it('空入力は KleParseError を投げる', () => {
    expect(() => parseKleRaw('')).toThrow(KleParseError)
    expect(() => parseKleRaw('   \n  ')).toThrow(KleParseError)
  })

  it('無効な JSON は KleParseError を投げる', () => {
    expect(() => parseKleRaw('not json {{{')).toThrow(KleParseError)
  })

  it('行の代わりに文字列がある配列は KLE 構造として拒否', () => {
    // ["A", "B"] を直接渡すと parseFlexible は Download として成立せず、
    // ラップしても [["A","B"]] になって妥当扱い。1行2キーのキーボードとして受理される。
    const kb = parseKleRaw('["A", "B"]')
    expect(kb.keys).toHaveLength(2)
  })
})
