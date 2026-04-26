<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

const keys = computed(() => keyboard.value?.keys ?? [])
const vb = useViewBox(keys)

const totalKeys = computed(() => keys.value.length)
const visibleKeys = computed(() => keys.value.filter((k) => !k.decal).length)

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
      <span>{{ t('keyPreview.title') }}</span>
      <span v-if="keyboard" class="text-xs font-normal text-slate-500">
        {{ t('keyPreview.keyCount', { total: totalKeys, visible: visibleKeys }) }}
      </span>
    </div>
    <div v-if="!keyboard" class="text-sm text-slate-500 py-8 text-center">
      {{ t('keyPreview.noKeyboard') }}
    </div>
    <div v-else class="overflow-auto bg-slate-100 rounded border border-slate-300">
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
      {{ t('keyPreview.legendIntro') }}
      <span class="text-red-600 font-medium">{{ t('keyPreview.legendRed') }}</span>
      {{ t('keyPreview.legendRedDesc') }} /
      <span class="text-yellow-700 font-medium">{{ t('keyPreview.legendYellow') }}</span>
      {{ t('keyPreview.legendYellowDesc') }}
    </p>
  </div>
</template>
