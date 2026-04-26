<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useConverterStore } from '../stores/useConverterStore'
import type { WarningKind } from '../types/app'

const store = useConverterStore()
const { warnings } = storeToRefs(store)
const { t } = useI18n()

const KIND_KEY: Record<WarningKind, string> = {
  'parse-error': 'warnings.kinds.parseError',
  'unparsed-label': 'warnings.kinds.unparsedLabel',
  'fallback-matrix': 'warnings.kinds.fallbackMatrix',
  'dropped-secondary-rect': 'warnings.kinds.droppedSecondaryRect',
  'dropped-meta-field': 'warnings.kinds.droppedMetaField',
  'duplicate-matrix': 'warnings.kinds.duplicateMatrix',
}

const labelOf = (kind: WarningKind): string => t(KIND_KEY[kind])
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      {{ t('warnings.title') }} <span class="text-xs font-normal text-slate-500">({{ warnings.length }})</span>
    </div>
    <div v-if="warnings.length === 0" class="text-sm text-slate-500">
      {{ t('warnings.empty') }}
    </div>
    <ul v-else class="space-y-1 max-h-48 overflow-auto text-xs">
      <li
        v-for="(w, i) in warnings"
        :key="i"
        class="border-l-4 pl-2 py-0.5"
        :class="w.kind === 'parse-error' ? 'border-red-500 bg-red-50' : 'border-yellow-400 bg-yellow-50'"
      >
        <span class="font-semibold">[{{ labelOf(w.kind) }}]</span>
        <span v-if="typeof w.keyIndex === 'number'" class="text-slate-500"> #{{ w.keyIndex }}</span>
        : {{ w.message }}
      </li>
    </ul>
  </div>
</template>
