<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConverterStore } from '../stores/useConverterStore'
import { describeKind } from '../converter/warnings'

const store = useConverterStore()
const { warnings } = storeToRefs(store)
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      ⚠ 警告 <span class="text-xs font-normal text-slate-500">({{ warnings.length }})</span>
    </div>
    <div v-if="warnings.length === 0" class="text-sm text-slate-500">
      警告はありません
    </div>
    <ul v-else class="space-y-1 max-h-48 overflow-auto text-xs">
      <li
        v-for="(w, i) in warnings"
        :key="i"
        class="border-l-4 pl-2 py-0.5"
        :class="w.kind === 'parse-error' ? 'border-red-500 bg-red-50' : 'border-yellow-400 bg-yellow-50'"
      >
        <span class="font-semibold">[{{ describeKind(w.kind) }}]</span>
        <span v-if="typeof w.keyIndex === 'number'" class="text-slate-500"> #{{ w.keyIndex }}</span>
        : {{ w.message }}
      </li>
    </ul>
  </div>
</template>
