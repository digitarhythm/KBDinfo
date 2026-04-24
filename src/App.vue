<script setup lang="ts">
import KleInput from './components/KleInput.vue'
import KeyPreview from './components/KeyPreview.vue'
import MatrixEditor from './components/MatrixEditor.vue'
import BulkMatrixTools from './components/BulkMatrixTools.vue'
import MetadataForm from './components/MetadataForm.vue'
import JsonOutput from './components/JsonOutput.vue'
import WarningsPanel from './components/WarningsPanel.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-slate-900 text-white px-4 py-3 shadow">
      <div class="max-w-[1600px] mx-auto flex items-center gap-3">
        <h1 class="text-lg font-semibold">KBDinfo</h1>
        <span class="text-xs text-slate-300">KLE raw → QMK info.json 変換ツール</span>
      </div>
    </header>
    <main class="flex-1 max-w-[1600px] mx-auto w-full p-4 grid gap-4 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <KleInput />
        <KeyPreview />
        <JsonOutput />
      </div>
      <div class="space-y-4">
        <MatrixEditor />
        <BulkMatrixTools />
        <MetadataForm />
        <WarningsPanel />
      </div>
    </main>
    <footer class="bg-slate-100 border-t border-slate-200 px-4 py-2 text-xs text-slate-500 text-center">
      KBDinfo — qmk.fm/converter 代替ツール / すべての処理はブラウザ内で完結します
    </footer>
  </div>
</template>
