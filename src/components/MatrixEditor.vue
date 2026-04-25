<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useConverterStore } from '../stores/useConverterStore'

const store = useConverterStore()
const { keyboard, selectedOriginalIndex, matrixOverrides, deletedIndices, visibleKeyIndices } =
  storeToRefs(store)

const isSelectedDeleted = computed(() =>
  selectedOriginalIndex.value !== null && deletedIndices.value.has(selectedOriginalIndex.value),
)

const selectedKey = computed(() => {
  if (selectedOriginalIndex.value === null || !keyboard.value) return null
  return keyboard.value.keys[selectedOriginalIndex.value] ?? null
})

const row = ref<number | null>(null)
const col = ref<number | null>(null)

watch(
  selectedOriginalIndex,
  (idx) => {
    if (idx === null || !keyboard.value) {
      row.value = null
      col.value = null
      return
    }
    const override = matrixOverrides.value[idx]
    if (override) {
      row.value = override[0]
      col.value = override[1]
      return
    }
    const key = keyboard.value.keys[idx]
    const lbl = (key?.labels[0] ?? '').split('\n', 1)[0]
    const m = /^(\d+)\s*,\s*(\d+)$/.exec(lbl.trim())
    if (m) {
      row.value = Number(m[1])
      col.value = Number(m[2])
    } else {
      row.value = null
      col.value = null
    }
  },
  { immediate: true },
)

const apply = (): void => {
  if (selectedOriginalIndex.value === null) return
  if (row.value === null || col.value === null) return
  // KLE RAW のラベル自体を "row,col" に書き換える。
  // 再パース後に preview / JSON / 赤表示はすべて自動追従する。
  store.applyMatrixToKey(selectedOriginalIndex.value, [row.value, col.value])
}

const clear = (): void => {
  if (selectedOriginalIndex.value === null) return
  store.setOverride(selectedOriginalIndex.value, null)
  row.value = null
  col.value = null
}

const goPrev = (): void => {
  if (selectedOriginalIndex.value === null) return
  const idx = visibleKeyIndices.value.indexOf(selectedOriginalIndex.value)
  if (idx > 0) selectedOriginalIndex.value = visibleKeyIndices.value[idx - 1]
}

const goNext = (): void => {
  if (selectedOriginalIndex.value === null) return
  const idx = visibleKeyIndices.value.indexOf(selectedOriginalIndex.value)
  if (idx >= 0 && idx < visibleKeyIndices.value.length - 1) {
    selectedOriginalIndex.value = visibleKeyIndices.value[idx + 1]
  }
}

const labelPreview = computed(() => selectedKey.value?.labels[0] ?? '')
</script>

<template>
  <div class="panel">
    <div class="panel-title">🎯 matrix 編集</div>
    <div v-if="!selectedKey" class="text-sm text-slate-500">
      プレビュー上でキーをクリックして選択してください
    </div>
    <div v-else class="space-y-3">
      <div class="text-xs text-slate-500">
        選択中キー #{{ selectedOriginalIndex }}
        <span v-if="labelPreview" class="ml-2">「{{ labelPreview.split('\n')[0] }}」</span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label">row</label>
          <input
            v-model.number="row"
            type="number"
            min="0"
            class="input"
            @keyup.enter="apply"
          />
        </div>
        <div>
          <label class="label">col</label>
          <input
            v-model.number="col"
            type="number"
            min="0"
            class="input"
            @keyup.enter="apply"
          />
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-primary" @click="apply">割当</button>
        <button type="button" class="btn" @click="clear">クリア</button>
        <button type="button" class="btn" @click="goPrev">◀ 前</button>
        <button type="button" class="btn" @click="goNext">次 ▶</button>
      </div>
      <div class="pt-2 border-t border-slate-200">
        <button
          v-if="!isSelectedDeleted"
          type="button"
          class="btn border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
          @click="store.deleteSelectedKey"
        >
          🗑️ このキーを設定から削除
        </button>
        <button
          v-else
          type="button"
          class="btn border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
          @click="store.restoreSelectedKey"
        >
          ↩️ 削除を取り消す
        </button>
        <p class="text-xs text-slate-500 mt-1">
          削除すると info.json の layout からも除外されます
        </p>
      </div>
    </div>
  </div>
</template>
