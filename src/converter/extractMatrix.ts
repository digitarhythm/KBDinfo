import type { MatrixCoord } from '../types/qmk'

// KLE ラベルは `row,col` 形式（カンマ区切り2数値）のみを matrix として解釈する。
// 空白を挟んでも可（例: "0, 12"）。複数行ラベルは先頭行のみを対象。
export const parseMatrixLabel = (raw: string | undefined | null): MatrixCoord | null => {
  if (!raw) return null
  const head = raw.split('\n', 1)[0].trim()
  if (!head) return null
  const m = /^(\d+)\s*,\s*(\d+)$/.exec(head)
  if (!m) return null
  return [Number(m[1]), Number(m[2])]
}
