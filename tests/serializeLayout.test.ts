import { describe, expect, it } from 'vitest'
import { kleToInfoJson } from '../src/converter'
import { defaultMetadataForm } from '../src/types/app'

describe('layout 配列のコンパクト整形', () => {
  it('各キーを1行で出力し、行頭は16スペースインデント', () => {
    const raw = '[["0,0","0,1"],["1,0","1,1"]]'
    const { json } = kleToInfoJson(raw, defaultMetadataForm())
    expect(json).toContain('                {"matrix":[0,0], "x":0, "y":0}')
    expect(json).toContain('                {"matrix":[1,1], "x":1, "y":1}')
  })

  it('label は出力に含めない', () => {
    const raw = '[["0,0","0,1"]]'
    const { json } = kleToInfoJson(raw, defaultMetadataForm())
    expect(json).not.toContain('"label"')
  })

  it('matrix 配列は [r,c] 詰め、キー間カンマの後にスペース', () => {
    const raw = '[["0,1"]]'
    const { json } = kleToInfoJson(raw, defaultMetadataForm())
    expect(json).toMatch(/\{"matrix":\[0,1\], "x":0, "y":0\}/)
  })

  it('w/h/r 等の追加属性も同じ行に並ぶ', () => {
    const raw = '[[{"w":1.5},"0,0"]]'
    const { json } = kleToInfoJson(raw, defaultMetadataForm())
    expect(json).toMatch(/\{"matrix":\[0,0\], "x":0, "y":0, "w":1.5\}/)
  })

  it('layouts 以外の配列（features/matrix_pins.rows など）は従来の複数行インデント', () => {
    const raw = '[["0,0"]]'
    const form = defaultMetadataForm()
    form.matrix_pins.rows = 'F0, F1'
    form.matrix_pins.cols = 'D0, D1'
    const { json } = kleToInfoJson(raw, form)
    // matrix_pins.rows 配列は従来通り複数行
    expect(json).toMatch(/"rows": \[\n\s+"F0",\n\s+"F1"\n\s+\]/)
  })

  it('layout 配列の全体は [\\n...\\n    ] で囲まれる', () => {
    const raw = '[["0,0","0,1"]]'
    const { json } = kleToInfoJson(raw, defaultMetadataForm())
    expect(json).toMatch(/"layout": \[\n {16}\{.+\},\n {16}\{.+\}\n {12}\]/)
  })

  it('row,col 形式でないラベルは matrix を配列として出力（[] で包む）', () => {
    const raw = '[["Esc","5.6"]]'
    const { json } = kleToInfoJson(raw, defaultMetadataForm())
    expect(json).toContain('{"matrix":["Esc"], "x":0, "y":0}')
    expect(json).toContain('{"matrix":[5.6], "x":1, "y":0}')
  })
})
