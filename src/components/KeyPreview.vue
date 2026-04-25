<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConverterStore } from '../stores/useConverterStore'
import KeyShape from './KeyShape.vue'
import { useViewBox } from '../composables/useSvgGeometry'

const store = useConverterStore()
const {
  keyboard,
  selectedOriginalIndex,
  invalidMatrixSet,
  duplicateMatrixSet,
  deletedIndices,
  matrixOverrides,
} = storeToRefs(store)

const keys = computed(() => keyboard.value?.keys ?? [])
const vb = useViewBox(keys)

const onSelect = (idx: number): void => {
  selectedOriginalIndex.value = idx
}

const overrideLabel = (i: number): string | null => {
  const ov = matrixOverrides.value[i]
  return ov ? `${ov[0]},${ov[1]}` : null
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
      KLE RAW データを貼り付けて「変換」ボタンを押すか、「JSON読み込み」してください
    </div>
    <div v-else class="overflow-auto bg-slate-100 rounded border border-slate-200">
      <svg
        :viewBox="vb.str"
        :width="vb.w"
        :height="vb.h"
        xmlns="http://www.w3.org/2000/svg"
        class="block"
      >
        <KeyShape
          v-for="(k, i) in keys"
          :key="i"
          :k="k"
          :original-index="i"
          :selected="selectedOriginalIndex === i"
          :invalid="invalidMatrixSet.has(i)"
          :duplicate="duplicateMatrixSet.has(i)"
          :deleted="deletedIndices.has(i)"
          :override-label="overrideLabel(i)"
          @select="onSelect"
        />
      </svg>
    </div>
    <p v-if="keyboard" class="text-xs text-slate-500 mt-2">
      キーをクリックすると右側パネルで matrix を編集できます。
      <span class="text-red-600 font-medium">赤色</span>: KLE ラベルが
      <code class="bg-slate-100 px-1 rounded">row,col</code>形式でない／
      <span class="text-yellow-700 font-medium">黄色</span>: matrix 値が他キーと重複。
    </p>
  </div>
</template>
