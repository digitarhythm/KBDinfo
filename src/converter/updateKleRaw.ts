import JSON5 from 'json5'

// parseKle と同じ判定ロジックでトップレベル配列として妥当かを検査する
const isValidKleTopLevel = (v: unknown): v is unknown[] => {
  if (!Array.isArray(v)) return false
  if (v.length === 0) return false
  return v.every((el, i) => {
    if (Array.isArray(el)) return true
    if (i === 0 && el !== null && typeof el === 'object') return true
    return false
  })
}

interface ParsedRaw {
  rows: unknown[]
  // Raw data タブ形式（外側ブラケット無し）として解釈した場合 true
  wasWrapped: boolean
}

const parseWithFormat = (raw: string): ParsedRaw => {
  const trimmed = raw.trim()
  try {
    const parsed = JSON5.parse(trimmed)
    if (isValidKleTopLevel(parsed)) return { rows: parsed, wasWrapped: false }
  } catch {
    /* fall through */
  }
  try {
    const wrapped = JSON5.parse('[' + trimmed + ']')
    if (isValidKleTopLevel(wrapped)) return { rows: wrapped, wasWrapped: true }
  } catch {
    /* fall through */
  }
  throw new Error('KLE raw として解析不能')
}

// 行配列（`unknown[]`）の文字列要素を visible key（decal 含む KLE 原配列 index）の順に書き換える
const rewriteLabels = (rows: unknown[], updates: Map<number, string>): void => {
  let count = 0
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const arr = row as unknown[]
    for (let i = 0; i < arr.length; i += 1) {
      if (typeof arr[i] === 'string') {
        if (updates.has(count)) {
          arr[i] = updates.get(count)!
        }
        count += 1
      }
    }
  }
}

const serializeBack = (rows: unknown[], wasWrapped: boolean): string => {
  const lines = rows.map((row) => JSON.stringify(row))
  if (wasWrapped) {
    // Raw data タブ形式: 外側 [] 無しで改行区切り
    return lines.join(',\n')
  }
  return '[\n' + lines.map((l) => '  ' + l).join(',\n') + '\n]'
}

/**
 * KLE raw 内の特定キーのラベル（labels[0] = 先頭行）を更新する。
 *
 * - `updates` のキーは KLE の原配列インデックス（decal 含む、kle-serial が付けるのと同じ並び）
 * - 書き換え後は JSON.stringify ベースで再シリアライズする。フォーマット保持は限定的。
 * - 元入力が Raw data タブ形式なら外側 `[]` 無しで出力、Download JSON なら通常の整形配列で出力。
 *
 * 解析不能な入力の場合は例外を投げる。
 */
export const updateKleRawLabels = (raw: string, updates: Map<number, string>): string => {
  if (updates.size === 0) return raw
  const { rows, wasWrapped } = parseWithFormat(raw)
  rewriteLabels(rows, updates)
  return serializeBack(rows, wasWrapped)
}
