<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConverterStore } from '../stores/useConverterStore'

const store = useConverterStore()
const { rawInput, parseError } = storeToRefs(store)

const fileInput = (e: Event): void => {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    rawInput.value = String(reader.result ?? '')
  }
  reader.readAsText(f, 'utf-8')
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      📝 KLE RAW 入力
      <div class="ml-auto flex gap-2">
        <label class="btn cursor-pointer">
          ファイル読込
          <input type="file" accept=".json,.txt,application/json" class="hidden" @change="fileInput" />
        </label>
        <button type="button" class="btn" @click="store.loadSample">サンプル読込</button>
      </div>
    </div>
    <textarea
      v-model="rawInput"
      class="input code w-full font-mono text-xs"
      rows="8"
      spellcheck="false"
      placeholder='keyboard-layout-editor.com の「Raw data」タブの内容、または「Download JSON」で取得した JSON を貼り付けてください（両方対応）'
    />
    <p v-if="parseError" class="mt-2 text-sm rounded bg-red-50 border border-red-300 text-red-700 p-2">
      ⚠ {{ parseError }}
    </p>
  </div>
</template>
