import JSON5 from 'json5'
import { deserialize } from '../kle/serial'
import type { KleKeyboard } from '../types/kle'

export class KleParseError extends Error {
  readonly cause: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'KleParseError'
    this.cause = cause
  }
}

// KLE raw として妥当なトップレベル配列か判定する。
// 各要素は「行（配列）」または（先頭のみ）メタデータオブジェクト。
const isValidKleTopLevel = (v: unknown): v is unknown[] => {
  if (!Array.isArray(v)) return false
  if (v.length === 0) return false
  return v.every((el, i) => {
    if (Array.isArray(el)) return true
    if (i === 0 && el !== null && typeof el === 'object') return true
    return false
  })
}

// KLE 入力は2形式を受け付ける:
//   (1) Download JSON: 外側 [...] で囲まれた完全な JSON
//   (2) Raw data タブ: 外側ブラケット無しのカンマ区切り行列挙（JSON5）
// まず (1) として試し、妥当でなければ [...] でラップして (2) として再解釈する。
const parseFlexible = (raw: string): unknown[] => {
  const trimmed = raw.trim()
  if (!trimmed) throw new KleParseError('入力が空です')

  let firstError: unknown = null

  // (1) Download JSON として直接パース
  try {
    const parsed = JSON5.parse(trimmed)
    if (isValidKleTopLevel(parsed)) return parsed
  } catch (e) {
    firstError = e
  }

  // (2) Raw data タブ形式として [...] でラップ
  try {
    const wrapped = JSON5.parse('[' + trimmed + ']')
    if (isValidKleTopLevel(wrapped)) return wrapped
  } catch (e) {
    if (firstError === null) firstError = e
  }

  const msg = firstError instanceof Error ? firstError.message : String(firstError ?? '形式不明')
  throw new KleParseError(`JSON構文エラー: ${msg}`, firstError)
}

export const parseKleRaw = (raw: string): KleKeyboard => {
  const rows = parseFlexible(raw)
  try {
    return deserialize(rows)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new KleParseError(`KLE構造エラー: ${msg}`, e)
  }
}
