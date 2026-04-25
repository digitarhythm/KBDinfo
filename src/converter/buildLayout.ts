import type { KleKey, KleKeyboard } from '../types/kle'
import type { LayoutKey, MatrixValue } from '../types/qmk'
import type { MatrixOverrides } from '../types/app'
import { WarningCollector } from './warnings'
import { parseMatrixLabel } from './extractMatrix'

const round6 = (n: number): number => Math.round(n * 1_000_000) / 1_000_000

const hasSecondaryRect = (k: KleKey): boolean => {
  return k.width2 !== k.width || k.height2 !== k.height || k.x2 !== 0 || k.y2 !== 0
}

// 有効な matrix ソースは KLE ラベル先頭行が `row,col`（カンマ区切り2数値）形式の時のみ。
// 空白を挟んでも可（例: "0, 12"）。それ以外の形式は UI 側で赤表示するため無効扱い。
const STRICT_COMMA_MATRIX = /^\s*\d+\s*,\s*\d+\s*$/

export const isStrictCommaMatrixLabel = (label: string | undefined | null): boolean => {
  if (!label) return false
  const head = label.split('\n', 1)[0]
  return STRICT_COMMA_MATRIX.test(head)
}

// ラベル文字列を matrix 値（常に配列）に変換する。
//   - カンマで分割し、全トークンが数値なら `[n, n, ...]`
//   - そうでなければ raw テキストを単一要素として包む `[raw]`
//     （数値1つなら `[n]`、文字列なら `["Esc"]`）
const labelToArrayValue = (head: string): MatrixValue => {
  const parts = head.split(',').map((s) => s.trim())
  const nums: number[] = []
  for (const p of parts) {
    if (p === '') return [head]
    const n = Number(p)
    if (!Number.isFinite(n)) return [head]
    nums.push(n)
  }
  return nums
}

// matrix 解決: override 優先、無ければラベル解析、それも失敗なら
// KLE ラベル先頭行をそのまま配列として出す。
// 空ラベルの場合のみフォールバック [0, visibleIndex] に戻す。
const resolveMatrix = (
  key: KleKey,
  originalIndex: number,
  visibleIndex: number,
  overrides: MatrixOverrides,
  warnings: WarningCollector,
): MatrixValue => {
  const override = overrides[originalIndex]
  if (override) return override

  const fromLabel = parseMatrixLabel(key.labels[0])
  if (fromLabel) return fromLabel

  const head = (key.labels[0] ?? '').split('\n', 1)[0].trim()
  if (head) {
    warnings.add(
      'unparsed-label',
      `ラベル "${head}" は row,col 形式でないため配列化して出力`,
      originalIndex,
    )
    return labelToArrayValue(head)
  }

  warnings.add('fallback-matrix', `空ラベルに [0, ${visibleIndex}] をフォールバック`, originalIndex)
  return [0, visibleIndex]
}

export interface BuildLayoutResult {
  layout: LayoutKey[]
  warnings: ReturnType<WarningCollector['list']>
  /**
   * matrix のソースが不正なキーの原配列インデックス集合。
   * 「KLE ラベルが厳密カンマ形式でない」かつ「override 未設定」の場合に含まれる。
   * プレビューで赤表示する対象。
   */
  invalidMatrixIndices: number[]
  /**
   * 最終 matrix 値が他キーと重複しているキーの原配列インデックス集合。
   * プレビューで黄表示する対象。
   */
  duplicateMatrixIndices: number[]
}

const matrixKey = (m: MatrixValue): string => m.map((x) => String(x)).join(',')

export const buildLayout = (
  keyboard: KleKeyboard,
  overrides: MatrixOverrides = {},
  deletedIndices: ReadonlySet<number> = new Set(),
): BuildLayoutResult => {
  const warnings = new WarningCollector()
  const layout: LayoutKey[] = []
  const matrixSeen = new Map<string, number[]>()
  const invalidMatrixIndices: number[] = []
  let visibleIndex = 0

  keyboard.keys.forEach((key, originalIndex) => {
    if (key.decal) return
    if (deletedIndices.has(originalIndex)) return

    if (hasSecondaryRect(key)) {
      warnings.add(
        'dropped-secondary-rect',
        'QMK info.json は二次矩形(x2/y2/w2/h2)を表現できません（出力ドロップ）',
        originalIndex,
      )
    }

    const matrix = resolveMatrix(key, originalIndex, visibleIndex, overrides, warnings)
    const key0: LayoutKey = {
      matrix,
      x: round6(key.x),
      y: round6(key.y),
    }

    if (key.width !== 1) key0.w = round6(key.width)
    if (key.height !== 1) key0.h = round6(key.height)
    if (key.rotation_angle !== 0) {
      key0.r = round6(key.rotation_angle)
      key0.rx = round6(key.rotation_x)
      key0.ry = round6(key.rotation_y)
    }

    // override が設定されていれば赤表示クリア（matrix エディタからの修正は有効な[row,col]）
    const hasOverride = overrides[originalIndex] !== undefined
    if (!hasOverride && !isStrictCommaMatrixLabel(key.labels[0])) {
      invalidMatrixIndices.push(originalIndex)
    }

    layout.push(key0)
    const mkey = matrixKey(matrix)
    const arr = matrixSeen.get(mkey) ?? []
    arr.push(originalIndex)
    matrixSeen.set(mkey, arr)

    visibleIndex += 1
  })

  const duplicateMatrixIndices: number[] = []
  for (const [mkey, idxs] of matrixSeen) {
    if (idxs.length > 1) {
      warnings.add('duplicate-matrix', `matrix ${mkey} が重複 (${idxs.length}キー)`)
      duplicateMatrixIndices.push(...idxs)
    }
  }

  return {
    layout,
    warnings: warnings.list(),
    invalidMatrixIndices,
    duplicateMatrixIndices,
  }
}
