import { computed, ref, shallowRef } from 'vue'
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

export const useConverterStore = defineStore('converter', () => {
  // KLE RAW テキスト本体。textarea と双方向バインドする。
  const rawInput = ref<string>('')
  // 「変換」または JSON 読込で確定後 true。textarea を read-only にする。
  const isLocked = ref<boolean>(false)
  const keyboard = shallowRef<KleKeyboard | null>(null)
  const parseError = ref<string | null>(null)

  const matrixOverrides = ref<MatrixOverrides>({})
  const deletedIndices = ref<Set<number>>(new Set())
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
      return {
        layout: [] as LayoutKey[],
        warnings: [] as Warning[],
        invalidMatrixIndices: [] as number[],
        duplicateMatrixIndices: [] as number[],
      }
    }
    return buildLayout(keyboard.value, matrixOverrides.value, deletedIndices.value)
  })

  const invalidMatrixSet = computed<Set<number>>(() => new Set(layoutResult.value.invalidMatrixIndices))
  const duplicateMatrixSet = computed<Set<number>>(() => new Set(layoutResult.value.duplicateMatrixIndices))

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

  // 「変換」ボタン: 解析が成功したらロック
  const convertNow = (): void => {
    parse()
    if (keyboard.value) isLocked.value = true
  }

  // 「クリア」ボタン: 全ての状態を初期化
  const clearAll = (): void => {
    rawInput.value = ''
    keyboard.value = null
    parseError.value = null
    isLocked.value = false
    matrixOverrides.value = {}
    deletedIndices.value = new Set()
    selectedOriginalIndex.value = null
  }

  // JSON ファイル読込: テキスト挿入と同時にロック・解析
  const loadJson = (text: string): void => {
    rawInput.value = text
    parse()
    if (keyboard.value) isLocked.value = true
  }

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

  // matrix エディタからの適用: override に保存（KLE RAW テキストは変更しない）
  const applyMatrixToKey = (originalIndex: number, matrix: MatrixCoord): void => {
    setOverride(originalIndex, matrix)
  }

  // 削除（出力 layout から除外）
  const deleteSelectedKey = (): void => {
    if (selectedOriginalIndex.value === null) return
    const next = new Set(deletedIndices.value)
    next.add(selectedOriginalIndex.value)
    deletedIndices.value = next
  }

  const restoreSelectedKey = (): void => {
    if (selectedOriginalIndex.value === null) return
    const next = new Set(deletedIndices.value)
    next.delete(selectedOriginalIndex.value)
    deletedIndices.value = next
  }

  return {
    rawInput,
    isLocked,
    keyboard,
    parseError,
    matrixOverrides,
    deletedIndices,
    metadata,
    selectedOriginalIndex,
    visibleKeyIndices,
    layoutResult,
    invalidMatrixSet,
    duplicateMatrixSet,
    infoJson,
    jsonText,
    warnings,
    parse,
    convertNow,
    clearAll,
    loadJson,
    setOverride,
    clearOverrides,
    applyMatrixToKey,
    deleteSelectedKey,
    restoreSelectedKey,
  }
})
