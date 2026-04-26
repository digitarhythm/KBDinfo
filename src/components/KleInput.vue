<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useConverterStore } from '../stores/useConverterStore'

const store = useConverterStore()
const { rawInput, isLocked, parseError } = storeToRefs(store)
const { t } = useI18n()

const fileInput = (e: Event): void => {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    store.loadJson(String(reader.result ?? ''))
  }
  reader.readAsText(f, 'utf-8')
  // 同じファイルを再選択できるよう値をリセット
  input.value = ''
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      {{ t('kleInput.title') }}
      <div class="ml-auto flex gap-2">
        <button type="button" class="btn" @click="store.clearAll">{{ t('kleInput.clear') }}</button>
        <label class="btn cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': isLocked }">
          {{ t('kleInput.loadJson') }}
          <input
            type="file"
            accept=".json,.txt,application/json"
            class="hidden"
            :disabled="isLocked"
            @change="fileInput"
          />
        </label>
      </div>
    </div>
    <textarea
      v-model="rawInput"
      :readonly="isLocked"
      :class="['input code w-full font-mono text-xs', isLocked ? 'bg-slate-100 cursor-not-allowed' : '']"
      rows="8"
      spellcheck="false"
      :placeholder="t('kleInput.placeholder')"
    />
    <div class="mt-2 flex items-center gap-2">
      <span v-if="isLocked" class="text-xs text-slate-500">
        {{ t('kleInput.locked') }}
      </span>
      <button
        type="button"
        class="btn btn-primary ml-auto"
        :disabled="isLocked || !rawInput.trim()"
        @click="store.convertNow"
      >
        {{ t('kleInput.convert') }}
      </button>
    </div>
    <p v-if="parseError" class="mt-2 text-sm rounded bg-red-50 border border-red-300 text-red-700 p-2">
      ⚠ {{ parseError }}
    </p>
  </div>
</template>
