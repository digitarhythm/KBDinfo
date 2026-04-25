import { describe, expect, it } from 'vitest'
import { deserialize } from '../src/kle/serial'
import { buildLayout } from '../src/converter/buildLayout'

const parse = (rows: unknown[]) => deserialize(rows)

describe('buildLayout', () => {
  it('単純なキーの座標を保持する', () => {
    const kb = parse([['0,0', '0,1', '0,2']])
    const { layout } = buildLayout(kb)
    expect(layout).toHaveLength(3)
    expect(layout[0]).toMatchObject({ matrix: [0, 0], x: 0, y: 0 })
    expect(layout[1]).toMatchObject({ matrix: [0, 1], x: 1, y: 0 })
    expect(layout[2]).toMatchObject({ matrix: [0, 2], x: 2, y: 0 })
    // label は出力に含めない
    expect(layout[0]).not.toHaveProperty('label')
  })

  it('w/h が 1 のときは出力に含めない', () => {
    const kb = parse([['0,0']])
    const { layout } = buildLayout(kb)
    expect(layout[0].w).toBeUndefined()
    expect(layout[0].h).toBeUndefined()
  })

  it('w/h が 1 でないときは出力に含める', () => {
    const kb = parse([[{ w: 2 }, '0,0', { h: 1.5 }, '0,1']])
    const { layout } = buildLayout(kb)
    expect(layout[0].w).toBe(2)
    expect(layout[1].h).toBe(1.5)
  })

  it('decal キーを除外する', () => {
    const kb = parse([['0,0', { d: true }, 'decal', '0,1']])
    const { layout } = buildLayout(kb)
    expect(layout).toHaveLength(2)
    expect(layout.map((k) => k.matrix)).toEqual([
      [0, 0],
      [0, 1],
    ])
  })

  it('回転角度がある場合 r/rx/ry を出力する', () => {
    const kb = parse([[{ r: 15, rx: 3, ry: 2 }, '0,0']])
    const { layout } = buildLayout(kb)
    expect(layout[0].r).toBe(15)
    expect(layout[0].rx).toBe(3)
    expect(layout[0].ry).toBe(2)
  })

  it('二次矩形(x2/y2/w2/h2)に警告を出す', () => {
    const kb = parse([[{ w: 1.25, h: 2, w2: 1.5, h2: 1, x2: -0.25 }, '0,0']])
    const { warnings } = buildLayout(kb)
    expect(warnings.some((w) => w.kind === 'dropped-secondary-rect')).toBe(true)
  })

  it('matrix override がラベルより優先される', () => {
    const kb = parse([['0,0', '0,1']])
    const { layout } = buildLayout(kb, { 0: [9, 9] })
    expect(layout[0].matrix).toEqual([9, 9])
    expect(layout[1].matrix).toEqual([0, 1])
  })

  it('ラベルが row,col 形式でない場合は配列として出力する', () => {
    const kb = parse([['Esc', '5.6', '5, 6, 7']])
    const { layout, warnings } = buildLayout(kb)
    // "Esc" は非数値 → 単一要素の文字列配列
    expect(layout[0].matrix).toEqual(['Esc'])
    // "5.6" は単一数値 → [5.6]
    expect(layout[1].matrix).toEqual([5.6])
    // "5, 6, 7" は複数数値 → [5, 6, 7]
    expect(layout[2].matrix).toEqual([5, 6, 7])
    expect(warnings.some((w) => w.kind === 'unparsed-label')).toBe(true)
  })

  it('空ラベルはフォールバック [0, visibleIndex] を使う', () => {
    const kb = parse([['', '']])
    const { layout, warnings } = buildLayout(kb)
    expect(layout[0].matrix).toEqual([0, 0])
    expect(layout[1].matrix).toEqual([0, 1])
    expect(warnings.some((w) => w.kind === 'fallback-matrix')).toBe(true)
  })

  it('matrix 重複に警告を出し duplicateMatrixIndices に含める', () => {
    const kb = parse([['0,0', '0,0']])
    const { warnings, duplicateMatrixIndices } = buildLayout(kb)
    expect(warnings.some((w) => w.kind === 'duplicate-matrix')).toBe(true)
    expect(duplicateMatrixIndices.sort()).toEqual([0, 1])
  })

  it('deletedIndices に含まれるキーは出力から除外される', () => {
    const kb = parse([['0,0', '0,1', '0,2']])
    const { layout } = buildLayout(kb, {}, new Set([1]))
    expect(layout).toHaveLength(2)
    expect(layout.map((k) => k.matrix)).toEqual([
      [0, 0],
      [0, 2],
    ])
  })

  it('削除された後で残ったキーのみ重複判定される', () => {
    // 3つとも [0,0] だが 2つ削除すれば最後の1つは重複しない
    const kb = parse([['0,0', '0,0', '0,0']])
    const { duplicateMatrixIndices } = buildLayout(kb, {}, new Set([0, 1]))
    expect(duplicateMatrixIndices).toEqual([])
  })

  it('複数行の y 座標を正しく扱う', () => {
    const kb = parse([
      ['0,0', '0,1'],
      ['1,0', '1,1'],
    ])
    const { layout } = buildLayout(kb)
    expect(layout[0].y).toBe(0)
    expect(layout[2].y).toBe(1)
    expect(layout[2].matrix).toEqual([1, 0])
  })

  describe('invalidMatrixIndices: matrix ソースの妥当性判定', () => {
    it('厳密なカンマ形式ラベルは invalid に含めない', () => {
      const kb = parse([['0,0', '1, 2']])
      const { invalidMatrixIndices } = buildLayout(kb)
      expect(invalidMatrixIndices).toEqual([])
    })

    it('カンマ形式以外のラベル（K03/R2C5/文字）は invalid', () => {
      const kb = parse([['K03', 'R2C5', 'Esc']])
      const { invalidMatrixIndices } = buildLayout(kb)
      expect(invalidMatrixIndices).toEqual([0, 1, 2])
    })

    it('空ラベルのキーも invalid', () => {
      const kb = parse([['', '']])
      const { invalidMatrixIndices } = buildLayout(kb)
      expect(invalidMatrixIndices).toEqual([0, 1])
    })

    it('override が設定されているキーは invalid から除外される', () => {
      const kb = parse([['Esc', '0,1', 'Tab']])
      const { invalidMatrixIndices } = buildLayout(kb, { 0: [9, 9], 2: [9, 8] })
      // override で値が確定したキーは赤表示しない
      expect(invalidMatrixIndices).toEqual([])
    })

    it('override 未設定でラベル不正のキーのみ invalid', () => {
      const kb = parse([['0,0', 'Esc', '0,2']])
      const { invalidMatrixIndices } = buildLayout(kb, { 1: [0, 1] })
      // override で 1 が救済されるので invalid は無し
      expect(invalidMatrixIndices).toEqual([])
    })

    it('override 無し・ラベル不正のキーは invalid', () => {
      const kb = parse([['Esc', 'Tab']])
      const { invalidMatrixIndices } = buildLayout(kb)
      expect(invalidMatrixIndices).toEqual([0, 1])
    })

    it('decal キーは invalid 判定の対象外（原配列 index も含まれない）', () => {
      const kb = parse([[{ d: true }, 'Esc', '0,0']])
      const { invalidMatrixIndices } = buildLayout(kb)
      // decal(index 0) は除外、0,0(index 1) は厳密カンマ
      expect(invalidMatrixIndices).toEqual([])
    })
  })
})
