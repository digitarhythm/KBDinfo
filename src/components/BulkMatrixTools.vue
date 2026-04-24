<script setup lang="ts">
import { useConverterStore } from '../stores/useConverterStore'

const store = useConverterStore()
</script>

<template>
  <div class="panel">
    <div class="panel-title">⚡ 一括採番</div>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn" @click="store.bulkNumber('by-row')">行優先で自動採番</button>
      <button type="button" class="btn" @click="store.bulkNumber('by-col')">列優先で自動採番</button>
      <button type="button" class="btn" @click="store.clearOverrides">全オーバーライド解除</button>
    </div>
    <p class="text-xs text-slate-500 mt-2">
      行優先: y座標が近いキーを1つの行とみなし、左から右へcol採番
    </p>
  </div>
</template>
