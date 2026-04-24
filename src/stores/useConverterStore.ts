import { computed, ref, shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import type { KleKeyboard } from '../types/kle'
import type { LayoutKey, MatrixCoord } from '../types/qmk'
import type { MatrixOverrides, MetadataFormState, Warning } from '../types/app'
import { defaultMetadataForm } from '../types/app'
import {
  buildLayout,
  buildInfoJson,
  parseKleRaw,
  seedFromKle,
  serializeInfoJson,
  KleParseError,
} from '../converter'
import { updateKleRawLabels } from '../converter/updateKleRaw'

// KLE の Raw data タブ形式（外側 [...] 無しの行列挙）
const SAMPLE_KLE = `{name: "Sample 2×2"},
["0,0", "0,1"],
["1,0", "1,1"]`

export const useConverterStore = defineStore('converter', () => {
  const rawInput = ref<string>(SAMPLE_KLE)
  const keyboard = shallowRef<KleKeyboard | null>(null)
  const parseError = ref<string | null>(null)

  const matrixOverrides = ref<MatrixOverrides>({})
  const metadata = ref<MetadataFormState>(defaultMetadataForm())
  const selectedOriginalIndex = ref<number | null>(null)

  const visibleKeyIndices = computed<number[]>(() => {
    if (!keyboard.value) return []
    const out: number[] = []
    keyboard.value.keys.forEach((k, i) => {
      if (!k.decal) out.push(i)
    })
    return out
  })

  const layoutResult = computed(() => {
    if (!keyboard.value) {
      return { layout: [] as LayoutKey[], warnings: [] as Warning[], invalidMatrixIndices: [] as number[] }
    }
    return buildLayout(keyboard.value, matrixOverrides.value)
  })

  const invalidMatrixSet = computed<Set<number>>(() => new Set(layoutResult.value.invalidMatrixIndices))

  const infoJson = computed(() => buildInfoJson(metadata.value, layoutResult.value.layout))
  const jsonText = computed(() => serializeInfoJson(infoJson.value))

  const warnings = computed<Warning[]>(() => {
    const list = layoutResult.value.warnings.slice()
    if (parseError.value) list.unshift({ kind: 'parse-error', message: parseError.value })
    if (keyboard.value?.meta) {
      const m = keyboard.value.meta
      const dropped: string[] = []
      if (m.switchMount) dropped.push(`switchMount=${m.switchMount}`)
      if (m.switchBrand) dropped.push(`switchBrand=${m.switchBrand}`)
      if (m.switchType) dropped.push(`switchType=${m.switchType}`)
      if (dropped.length > 0) {
        list.push({
          kind: 'dropped-meta-field',
          message: `KLEメタ情報のうちQMK非対応項目: ${dropped.join(', ')}`,
        })
      }
    }
    return list
  })

  const parse = (): void => {
    const raw = rawInput.value.trim()
    if (!raw) {
      keyboard.value = null
      parseError.value = null
      return
    }
    try {
      keyboard.value = parseKleRaw(raw)
      parseError.value = null
      const seed = seedFromKle(keyboard.value)
      if (seed.keyboard_name && !metadata.value.keyboard_name) {
        metadata.value.keyboard_name = seed.keyboard_name
      }
      if (seed.maintainer && metadata.value.maintainer === 'qmk') {
        metadata.value.maintainer = seed.maintainer
      }
      metadata.value.notesFromKle = seed.notesFromKle ?? ''
    } catch (e) {
      keyboard.value = null
      parseError.value = e instanceof KleParseError ? e.message : String(e)
    }
  }

  // 入力変更時に debounced parse
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(rawInput, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => parse(), 250)
  }, { immediate: true })

  const setOverride = (originalIndex: number, matrix: MatrixCoord | null): void => {
    if (matrix === null) {
      const next = { ...matrixOverrides.value }
      delete next[originalIndex]
      matrixOverrides.value = next
    } else {
      matrixOverrides.value = { ...matrixOverrides.value, [originalIndex]: matrix }
    }
  }

  const clearOverrides = (): void => {
    matrixOverrides.value = {}
  }

  // RAW テキストを書き換えるヘルパ。失敗時は parseError に詳細を出す
  const applyLabelUpdatesToRaw = (updates: Map<number, string>): boolean => {
    try {
      rawInput.value = updateKleRawLabels(rawInput.value, updates)
      return true
    } catch (e) {
      parseError.value = e instanceof Error ? e.message : String(e)
      return false
    }
  }

  // matrix エディタからの適用: [row, col] を「row,col」ラベルとして KLE RAW に書き戻す
  const applyMatrixToKey = (originalIndex: number, matrix: MatrixCoord): boolean => {
    const newLabel = `${matrix[0]},${matrix[1]}`
    const ok = applyLabelUpdatesToRaw(new Map([[originalIndex, newLabel]]))
    if (ok) {
      // 直接ラベル修正したので override は不要
      setOverride(originalIndex, null)
    }
    return ok
  }

  const loadSample = (): void => {
    rawInput.value = SAMPLE_KLE
  }

  return {
    rawInput,
    keyboard,
    parseError,
    matrixOverrides,
    metadata,
    selectedOriginalIndex,
    visibleKeyIndices,
    layoutResult,
    invalidMatrixSet,
    infoJson,
    jsonText,
    warnings,
    parse,
    setOverride,
    clearOverrides,
    applyMatrixToKey,
    loadSample,
  }
})
