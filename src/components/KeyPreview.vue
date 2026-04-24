<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConverterStore } from '../stores/useConverterStore'
import KeyShape from './KeyShape.vue'
import { useViewBox } from '../composables/useSvgGeometry'

const store = useConverterStore()
const { keyboard, selectedOriginalIndex, layoutResult, matrixOverrides, invalidMatrixSet } = storeToRefs(store)

const keys = computed(() => keyboard.value?.keys ?? [])
const vb = useViewBox(keys)

const matrixMap = computed<Map<number, [number, number]>>(() => {
  const m = new Map<number, [number, number]>()
  if (!keyboard.value) return m
  const { layout } = layoutResult.value
  let layoutIndex = 0
  keyboard.value.keys.forEach((k, i) => {
    if (k.decal) return
    const entry = layout[layoutIndex]
    if (entry) m.set(i, entry.matrix)
    layoutIndex += 1
  })
  return m
})

const matrixFor = (originalIndex: number): [number, number] | null => {
  const override = matrixOverrides.value[originalIndex]
  if (override) return override
  return matrixMap.value.get(originalIndex) ?? null
}

const onSelect = (idx: number): void => {
  selectedOriginalIndex.value = idx
}

const onDeselect = (): void => {
  selectedOriginalIndex.value = null
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      <span>🖼️ プレビュー</span>
      <span v-if="keyboard" class="text-xs font-normal text-slate-500">
        キー数: {{ keys.length }}（表示対象 {{ keys.filter((k) => !k.decal).length }}）
      </span>
    </div>
    <div v-if="!keyboard" class="text-sm text-slate-500 py-8 text-center">
      KLE RAW データを入力するとここにプレビューが表示されます
    </div>
    <div
      v-else
      class="overflow-auto bg-slate-100 rounded border border-slate-200"
      @click.self="onDeselect"
    >
      <svg
        :viewBox="vb.str"
        :width="vb.w"
        :height="vb.h"
        xmlns="http://www.w3.org/2000/svg"
        class="block"
        @click.self="onDeselect"
      >
        <KeyShape
          v-for="(k, i) in keys"
          :key="i"
          :k="k"
          :original-index="i"
          :selected="selectedOriginalIndex === i"
          :matrix="matrixFor(i)"
          :invalid="invalidMatrixSet.has(i)"
          @select="onSelect"
        />
      </svg>
    </div>
    <p v-if="keyboard" class="text-xs text-slate-500 mt-2">
      キーをクリックすると右側パネルで matrix を編集できます。
      <span class="text-red-600 font-medium">赤色</span>のキーは matrix が
      <code class="bg-slate-100 px-1 rounded">row,col</code> 形式で
      指定されていないため、右ペインで手動設定が必要です。
    </p>
  </div>
</template>
