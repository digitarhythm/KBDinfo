import JSON5 from 'json5'

// KLE raw 形式パーサ（kle-serial の自前実装版）
//
// 参考: https://github.com/ijprest/kle-serial (MIT)
//       https://github.com/ijprest/keyboard-layout-editor/blob/master/serial.js
// 修正: kle-serial 0.15.1 では rx/ry 指定時に current.x/y がリセットされず、
//       回転クラスタ先頭行のキー位置が誤る。本実装では KLE 本家に準拠して
//       rx/ry 指定時に cursor を (rx, ry) にリセットする。

export interface KeyDefault {
  textColor: string
  textSize: number
}

export class Key {
  color = '#cccccc'
  labels: string[] = []
  textColor: Array<string | undefined> = []
  textSize: Array<number | undefined> = []
  default: KeyDefault = { textColor: '#000000', textSize: 3 }
  x = 0
  y = 0
  width = 1
  height = 1
  x2 = 0
  y2 = 0
  width2 = 1
  height2 = 1
  rotation_x = 0
  rotation_y = 0
  rotation_angle = 0
  decal = false
  ghost = false
  stepped = false
  nub = false
  profile = ''
  sm = ''
  sb = ''
  st = ''
}

export class KeyboardMetadata {
  author = ''
  backcolor = '#eeeeee'
  background: { name?: string; style?: string } | null = null
  name = ''
  notes = ''
  radii = ''
  switchBrand = ''
  switchMount = ''
  switchType = ''
  pcb = false
  plate = false
  css = ''
}

export class Keyboard {
  meta: KeyboardMetadata = new KeyboardMetadata()
  keys: Key[] = []
}

// align に応じたラベル位置マッピング（kle-serial 由来）
// prettier-ignore
const LABEL_MAP: number[][] = [
  [0, 6, 2, 8, 9, 11, 3, 5, 1, 4, 7, 10],
  [1, 7, -1, -1, 9, 11, 4, -1, -1, -1, -1, 10],
  [3, -1, 5, -1, 9, 11, -1, -1, 4, -1, -1, 10],
  [4, -1, -1, -1, 9, 11, -1, -1, -1, -1, -1, 10],
  [0, 6, 2, 8, 10, -1, 3, 5, 1, 4, 7, -1],
  [1, 7, -1, -1, 10, -1, 4, -1, -1, -1, -1, -1],
  [3, -1, 5, -1, 10, -1, -1, -1, 4, -1, -1, -1],
  [4, -1, -1, -1, 10, -1, -1, -1, -1, -1, -1, -1],
]

const reorderLabelsIn = <T>(
  labels: Array<T | undefined | null>,
  align: number,
  def: T | null = null,
): Array<T | undefined> => {
  const ret: Array<T | undefined> = []
  for (let i = 0; i < labels.length; i += 1) {
    const v = labels[i]
    if (v && v !== def) {
      const idx = LABEL_MAP[align]?.[i]
      if (idx !== undefined && idx >= 0) ret[idx] = v
    }
  }
  return ret
}

const copyKey = (src: Key): Key => {
  const dst = new Key()
  dst.color = src.color
  dst.labels = src.labels.slice()
  dst.textColor = src.textColor.slice()
  dst.textSize = src.textSize.slice()
  dst.default = { ...src.default }
  dst.x = src.x
  dst.y = src.y
  dst.width = src.width
  dst.height = src.height
  dst.x2 = src.x2
  dst.y2 = src.y2
  dst.width2 = src.width2
  dst.height2 = src.height2
  dst.rotation_x = src.rotation_x
  dst.rotation_y = src.rotation_y
  dst.rotation_angle = src.rotation_angle
  dst.decal = src.decal
  dst.ghost = src.ghost
  dst.stepped = src.stepped
  dst.nub = src.nub
  dst.profile = src.profile
  dst.sm = src.sm
  dst.sb = src.sb
  dst.st = src.st
  return dst
}

export class KleDeserializeError extends Error {
  constructor(message: string, public data?: unknown) {
    super(message)
    this.name = 'KleDeserializeError'
  }
}

const deserializeError = (msg: string, data?: unknown): never => {
  const detail = data !== undefined ? `${msg}:\n  ${JSON5.stringify(data)}` : msg
  throw new KleDeserializeError(detail, data)
}

interface KleProp {
  x?: number
  y?: number
  w?: number
  h?: number
  x2?: number
  y2?: number
  w2?: number
  h2?: number
  r?: number
  rx?: number
  ry?: number
  l?: boolean
  n?: boolean
  d?: boolean
  g?: boolean
  c?: string
  t?: string
  a?: number
  f?: number
  f2?: number
  fa?: number[]
  p?: string
  sm?: string
  sb?: string
  st?: string
}

export const deserialize = (rows: unknown): Keyboard => {
  if (!Array.isArray(rows)) deserializeError('expected an array of objects')

  let current = new Key()
  const kbd = new Keyboard()
  let align = 4

  const rowsArr = rows as unknown[]
  for (let r = 0; r < rowsArr.length; r += 1) {
    const row = rowsArr[r]
    if (Array.isArray(row)) {
      for (let k = 0; k < row.length; k += 1) {
        const item = row[k]
        if (typeof item === 'string') {
          const newKey = copyKey(current)
          newKey.width2 = current.width2 === 0 ? current.width : current.width2
          newKey.height2 = current.height2 === 0 ? current.height : current.height2
          newKey.labels = reorderLabelsIn(item.split('\n'), align) as string[]
          newKey.textSize = reorderLabelsIn(newKey.textSize, align)
          for (let i = 0; i < 12; i += 1) {
            if (!newKey.labels[i]) {
              delete newKey.textSize[i]
              delete newKey.textColor[i]
            }
            if (newKey.textSize[i] === newKey.default.textSize) delete newKey.textSize[i]
            if (newKey.textColor[i] === newKey.default.textColor) delete newKey.textColor[i]
          }
          kbd.keys.push(newKey)
          // 次キー用のカーソル進行
          current.x += current.width
          current.width = current.height = 1
          current.x2 = current.y2 = 0
          current.width2 = current.height2 = 0
          current.nub = current.stepped = current.decal = false
        } else if (item && typeof item === 'object') {
          const p = item as KleProp
          if (k !== 0 && (p.r !== undefined || p.rx !== undefined || p.ry !== undefined)) {
            deserializeError('rotation can only be specified on the first key in a row', p)
          }
          if (p.r !== undefined) current.rotation_angle = p.r
          // --- kle-serial 0.15.1 のバグ修正ポイント ---
          // KLE 本家 serial.js の挙動に合わせる。
          // rx 指定時: current.rotation_x = rx, current.x = rx,
          //            current.y は **既存の** rotation_y にリセット（片側のみ指定時もクラスタ原点に戻す）
          // ry 指定時: current.rotation_y = ry, current.y = ry,
          //            current.x は **既存の** rotation_x にリセット
          // 両方指定時はこの順序で処理されるので最終的に (rx, ry) になる。
          if (p.rx !== undefined) {
            current.rotation_x = p.rx
            current.x = p.rx
            current.y = current.rotation_y
          }
          if (p.ry !== undefined) {
            current.rotation_y = p.ry
            current.y = p.ry
            current.x = current.rotation_x
          }
          // -------------------------------------------
          if (p.a !== undefined) align = p.a
          if (p.f) {
            current.default.textSize = p.f
            current.textSize = []
          }
          if (p.f2 !== undefined) {
            for (let i = 1; i < 12; i += 1) current.textSize[i] = p.f2
          }
          if (p.fa !== undefined) current.textSize = p.fa.slice()
          if (p.p !== undefined) current.profile = p.p
          if (p.c !== undefined) current.color = p.c
          if (p.t !== undefined) {
            const split = p.t.split('\n')
            current.default.textColor = split[0]
            current.textColor = reorderLabelsIn(split, align, current.default.textColor) as string[]
          }
          if (p.x !== undefined) current.x += p.x
          if (p.y !== undefined) current.y += p.y
          if (p.w !== undefined) {
            current.width = p.w
            current.width2 = p.w
          }
          if (p.h !== undefined) {
            current.height = p.h
            current.height2 = p.h
          }
          if (p.x2 !== undefined) current.x2 = p.x2
          if (p.y2 !== undefined) current.y2 = p.y2
          if (p.w2 !== undefined) current.width2 = p.w2
          if (p.h2 !== undefined) current.height2 = p.h2
          if (p.n !== undefined) current.nub = !!p.n
          if (p.l !== undefined) current.stepped = !!p.l
          if (p.d !== undefined) current.decal = !!p.d
          if (p.g !== undefined) current.ghost = !!p.g
          if (p.sm !== undefined) current.sm = p.sm
          if (p.sb !== undefined) current.sb = p.sb
          if (p.st !== undefined) current.st = p.st
        }
      }
      // 行末: x はクラスタ原点に戻し、y は 1 つ下げる
      current.y += 1
      current.x = current.rotation_x
    } else if (row && typeof row === 'object') {
      if (r !== 0) {
        deserializeError('keyboard metadata must be the first element', row)
      }
      const meta = row as Record<string, unknown>
      const out = kbd.meta as unknown as Record<string, unknown>
      for (const prop of Object.keys(out)) {
        if (meta[prop] !== undefined && meta[prop] !== null) {
          out[prop] = meta[prop]
        }
      }
    }
  }

  return kbd
}

export const parse = (json: string): Keyboard => deserialize(JSON5.parse(json))

// kle-serial 互換の名前空間エクスポート
export const Serial = { deserialize, parse }
