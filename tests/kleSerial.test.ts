import { describe, expect, it } from 'vitest'
import { deserialize, parse } from '../src/kle/serial'

describe('KLE serial 自前実装', () => {
  it('単純な 1 行のキー位置', () => {
    const kb = deserialize([['A', 'B', 'C']])
    expect(kb.keys.map((k) => [k.x, k.y, k.labels[0]])).toEqual([
      [0, 0, 'A'],
      [1, 0, 'B'],
      [2, 0, 'C'],
    ])
  })

  it('複数行で y が加算される', () => {
    const kb = deserialize([['A'], ['B'], ['C']])
    expect(kb.keys.map((k) => [k.x, k.y])).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
    ])
  })

  it('w/h が次キー以降にリセットされる', () => {
    const kb = deserialize([[{ w: 2 }, 'A', 'B']])
    expect(kb.keys[0].width).toBe(2)
    expect(kb.keys[1].width).toBe(1)
  })

  it('回転クラスタで rx/ry が先頭キー座標に反映される（kle-serial バグ修正）', () => {
    const kb = deserialize([[{ rx: 5, ry: 3, r: 15 }, 'A', 'B']])
    expect(kb.keys[0]).toMatchObject({ x: 5, y: 3, rotation_x: 5, rotation_y: 3, rotation_angle: 15 })
    expect(kb.keys[1]).toMatchObject({ x: 6, y: 3, rotation_x: 5, rotation_y: 3, rotation_angle: 15 })
  })

  it('rx/ry 指定後の item.x / item.y はオフセットとして加算', () => {
    const kb = deserialize([[{ rx: 2, ry: 1, r: 10, x: 0.5, y: 0.25 }, 'A']])
    expect(kb.keys[0]).toMatchObject({ x: 2.5, y: 1.25, rotation_x: 2, rotation_y: 1 })
  })

  it('rx のみ指定した場合 y は既存の rotation_y にリセット（KLE本家挙動）', () => {
    // 先にクラスタを定義してrotation_y=3.22に設定、その後にrx単独変更
    const kb = deserialize([
      [{ rx: 4.31, ry: 3.22, r: 9, y: -0.5, x: -0.5 }, 'A'],
      [{ r: -9, rx: 12.7, y: -0.5, x: -0.5 }, 'B'],
    ])
    // 2行目のキー B: rx=12.7（ry省略）→ rotation_yは3.22のまま、yはそこから-0.5で2.72
    expect(kb.keys[1]).toMatchObject({
      x: 12.2,
      y: 2.72,
      rotation_x: 12.7,
      rotation_y: 3.22,
      rotation_angle: -9,
    })
  })

  it('ry のみ指定した場合 x は既存の rotation_x にリセット', () => {
    const kb = deserialize([
      [{ rx: 5, ry: 3, r: 10, y: -0.5, x: -0.5 }, 'A'],
      [{ ry: 2 }, 'B'],
    ])
    // 2行目のキー B: ry=2（rx省略）→ rotation_xは5のまま、x=5, y=2
    expect(kb.keys[1]).toMatchObject({
      x: 5,
      y: 2,
      rotation_x: 5,
      rotation_y: 2,
    })
  })

  it('回転クラスタ内で行が進む時は x をクラスタ原点へ戻す', () => {
    const kb = deserialize([
      [{ rx: 5, ry: 3, r: 15 }, 'A', 'B'],
      ['C', 'D'],
    ])
    expect(kb.keys[0]).toMatchObject({ x: 5, y: 3 })
    expect(kb.keys[2]).toMatchObject({ x: 5, y: 4 }) // C: 行が下がり x は rx に戻る
    expect(kb.keys[3]).toMatchObject({ x: 6, y: 4 })
  })

  it('decal フラグが次キーでリセットされる', () => {
    const kb = deserialize([[{ d: true }, 'decoration', 'normal']])
    expect(kb.keys[0].decal).toBe(true)
    expect(kb.keys[1].decal).toBe(false)
  })

  it('メタデータを先頭オブジェクトから抽出', () => {
    const kb = deserialize([{ name: 'Test', author: 'alice' }, ['A']])
    expect(kb.meta.name).toBe('Test')
    expect(kb.meta.author).toBe('alice')
  })

  it('メタデータが先頭以外にある場合エラー', () => {
    expect(() => deserialize([['A'], { name: 'bad' }])).toThrow()
  })

  it('回転指定が行の先頭以外にある場合エラー', () => {
    expect(() => deserialize([['A', { r: 15 }, 'B']])).toThrow()
  })

  it('JSON5 形式（unquoted key、trailing comma）を受け付ける', () => {
    const kb = parse('[[{x:1,},"A"]]')
    expect(kb.keys[0]).toMatchObject({ x: 1, labels: ['A'] })
  })

  it('色 c が後続キーに継承される', () => {
    const kb = deserialize([[{ c: '#ff0000' }, 'A', 'B']])
    expect(kb.keys[0].color).toBe('#ff0000')
    expect(kb.keys[1].color).toBe('#ff0000')
  })

  it('secondary 矩形 w2/h2/x2/y2 を保持', () => {
    const kb = deserialize([[{ w: 1.25, h: 2, w2: 1.5, h2: 1, x2: -0.25 }, 'ISO']])
    expect(kb.keys[0]).toMatchObject({ width: 1.25, height: 2, width2: 1.5, height2: 1, x2: -0.25 })
  })
})
