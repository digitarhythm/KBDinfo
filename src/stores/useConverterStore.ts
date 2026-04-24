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

const SAMPLE_KLE = `[
  {"name": "Sample 2×2"},
  ["0,0", "0,1"],
  ["1,0", "1,1"]
]`

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

  const layoutResult = computed<{ layout: LayoutKey[]; warnings: Warning[] }>(() => {
    if (!keyboard.value) return { layout: [], warnings: [] }
    return buildLayout(keyboard.value, matrixOverrides.value)
  })

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

  const bulkNumber = (mode: 'by-row' | 'by-col'): void => {
    if (!keyboard.value) return
    const next: MatrixOverrides = {}
    const visible = keyboard.value.keys
      .map((k, i) => ({ k, i }))
      .filter(({ k }) => !k.decal)
    if (mode === 'by-row') {
      const sorted = visible.slice().sort((a, b) => (a.k.y - b.k.y) || (a.k.x - b.k.x))
      const rowBreaks: Array<typeof sorted> = []
      let currentY = Number.NEGATIVE_INFINITY
      let bucket: typeof sorted = []
      for (const item of sorted) {
        if (Math.abs(item.k.y - currentY) > 0.5) {
          if (bucket.length > 0) rowBreaks.push(bucket)
          bucket = []
          currentY = item.k.y
        }
        bucket.push(item)
      }
      if (bucket.length > 0) rowBreaks.push(bucket)
      rowBreaks.forEach((row, r) => {
        row.forEach((item, c) => {
          next[item.i] = [r, c]
        })
      })
    } else {
      const sorted = visible.slice().sort((a, b) => (a.k.x - b.k.x) || (a.k.y - b.k.y))
      const colBreaks: Array<typeof sorted> = []
      let currentX = Number.NEGATIVE_INFINITY
      let bucket: typeof sorted = []
      for (const item of sorted) {
        if (Math.abs(item.k.x - currentX) > 0.5) {
          if (bucket.length > 0) colBreaks.push(bucket)
          bucket = []
          currentX = item.k.x
        }
        bucket.push(item)
      }
      if (bucket.length > 0) colBreaks.push(bucket)
      colBreaks.forEach((col, c) => {
        col.forEach((item, r) => {
          next[item.i] = [r, c]
        })
      })
    }
    matrixOverrides.value = next
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
    infoJson,
    jsonText,
    warnings,
    parse,
    setOverride,
    clearOverrides,
    bulkNumber,
    loadSample,
  }
})
