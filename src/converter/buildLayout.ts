import type { KleKey, KleKeyboard } from '../types/kle'
import type { LayoutKey, MatrixCoord } from '../types/qmk'
import type { MatrixOverrides } from '../types/app'
import { WarningCollector } from './warnings'
import { parseMatrixLabel } from './extractMatrix'

const round6 = (n: number): number => Math.round(n * 1_000_000) / 1_000_000

const hasSecondaryRect = (k: KleKey): boolean => {
  return k.width2 !== k.width || k.height2 !== k.height || k.x2 !== 0 || k.y2 !== 0
}

const resolveMatrix = (
  key: KleKey,
  originalIndex: number,
  visibleIndex: number,
  overrides: MatrixOverrides,
  warnings: WarningCollector,
): MatrixCoord => {
  const override = overrides[originalIndex]
  if (override) return override

  const fromLabel = parseMatrixLabel(key.labels[0])
  if (fromLabel) return fromLabel

  if (key.labels[0] && key.labels[0].trim()) {
    warnings.add('unparsed-label', `ラベル "${key.labels[0].split('\n', 1)[0]}" からmatrix抽出できず`, originalIndex)
  }
  warnings.add('fallback-matrix', `[0, ${visibleIndex}] をフォールバックとして割り当て`, originalIndex)
  return [0, visibleIndex]
}

export interface BuildLayoutResult {
  layout: LayoutKey[]
  warnings: ReturnType<WarningCollector['list']>
}

export const buildLayout = (
  keyboard: KleKeyboard,
  overrides: MatrixOverrides = {},
): BuildLayoutResult => {
  const warnings = new WarningCollector()
  const layout: LayoutKey[] = []
  const matrixSeen = new Map<string, number[]>()
  let visibleIndex = 0

  keyboard.keys.forEach((key, originalIndex) => {
    if (key.decal) return

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

    layout.push(key0)
    const mkey = `${matrix[0]},${matrix[1]}`
    const arr = matrixSeen.get(mkey) ?? []
    arr.push(originalIndex)
    matrixSeen.set(mkey, arr)

    visibleIndex += 1
  })

  for (const [mkey, idxs] of matrixSeen) {
    if (idxs.length > 1) {
      warnings.add('duplicate-matrix', `matrix ${mkey} が重複 (${idxs.length}キー)`)
    }
  }

  return { layout, warnings: warnings.list() }
}
