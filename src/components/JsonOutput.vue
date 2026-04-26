<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useConverterStore } from '../stores/useConverterStore'

const store = useConverterStore()
const { jsonText, keyboard, metadata } = storeToRefs(store)
const { t } = useI18n()
const copied = ref(false)

const copy = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(jsonText.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // noop
  }
}

const download = (): void => {
  const blob = new Blob([jsonText.value], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const name = (metadata.value.keyboard_name || 'keyboard').replace(/[^a-zA-Z0-9_-]/g, '_')
  a.href = url
  a.download = `${name}.info.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">
      {{ t('jsonOutput.title') }}
      <div class="ml-auto flex gap-2">
        <button type="button" class="btn" :disabled="!keyboard" @click="copy">
          {{ copied ? t('jsonOutput.copied') : t('jsonOutput.copy') }}
        </button>
        <button type="button" class="btn btn-primary" :disabled="!keyboard" @click="download">
          {{ t('jsonOutput.download') }}
        </button>
      </div>
    </div>
    <pre
      class="text-xs bg-slate-900 text-slate-100 rounded p-3 overflow-auto max-h-96 whitespace-pre"
    >{{ jsonText }}</pre>
  </div>
</template>
