<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConverterStore } from '../stores/useConverterStore'

const store = useConverterStore()
const { metadata } = storeToRefs(store)

const PROCESSORS = [
  'atmega32u4',
  'atmega32u2',
  'at90usb1286',
  'at90usb646',
  'STM32F103',
  'STM32F303',
  'STM32F401',
  'STM32F411',
  'RP2040',
]
const BOOTLOADERS = [
  'atmel-dfu',
  'qmk-dfu',
  'halfkay',
  'caterina',
  'stm32-dfu',
  'stm32duino',
  'rp2040',
]
const FEATURE_KEYS: Array<keyof typeof metadata.value.features> = [
  'bootmagic',
  'mousekey',
  'extrakey',
  'nkro',
  'console',
  'command',
  'backlight',
  'rgblight',
  'audio',
]
</script>

<template>
  <div class="panel">
    <div class="panel-title">🧾 メタデータ</div>
    <div v-if="metadata.notesFromKle" class="text-xs bg-blue-50 border border-blue-200 rounded p-2 mb-3 whitespace-pre-wrap">
      <span class="font-semibold">KLE notes:</span> {{ metadata.notesFromKle }}
    </div>
    <div class="grid grid-cols-2 gap-2">
      <div class="col-span-2">
        <label class="label">keyboard_name</label>
        <input v-model="metadata.keyboard_name" class="input" />
      </div>
      <div>
        <label class="label">manufacturer</label>
        <input v-model="metadata.manufacturer" class="input" />
      </div>
      <div>
        <label class="label">maintainer</label>
        <input v-model="metadata.maintainer" class="input" />
      </div>
      <div class="col-span-2">
        <label class="label">url</label>
        <input v-model="metadata.url" class="input" />
      </div>

      <div>
        <label class="label">USB VID</label>
        <input v-model="metadata.usb.vid" class="input" placeholder="0xFEED" />
      </div>
      <div>
        <label class="label">USB PID</label>
        <input v-model="metadata.usb.pid" class="input" placeholder="0x0000" />
      </div>
      <div class="col-span-2">
        <label class="label">device_version</label>
        <input v-model="metadata.usb.device_version" class="input" placeholder="0.0.1" />
      </div>

      <div class="col-span-2">
        <label class="label">matrix_pins.rows（カンマまたは空白区切り）</label>
        <input v-model="metadata.matrix_pins.rows" class="input" placeholder="例: F0, F1, F4, F5" />
      </div>
      <div class="col-span-2">
        <label class="label">matrix_pins.cols</label>
        <input v-model="metadata.matrix_pins.cols" class="input" placeholder="例: D0, D1, D2, D3, D4" />
      </div>
      <div>
        <label class="label">diode_direction</label>
        <select v-model="metadata.diode_direction" class="input">
          <option value="COL2ROW">COL2ROW</option>
          <option value="ROW2COL">ROW2COL</option>
        </select>
      </div>
      <div>
        <label class="label">processor</label>
        <select v-model="metadata.processor" class="input">
          <option v-for="p in PROCESSORS" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div class="col-span-2">
        <label class="label">bootloader</label>
        <select v-model="metadata.bootloader" class="input">
          <option v-for="b in BOOTLOADERS" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>
    </div>

    <div class="mt-3">
      <div class="label">features</div>
      <div class="grid grid-cols-3 gap-1 text-sm">
        <label v-for="f in FEATURE_KEYS" :key="f" class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="metadata.features[f]" />
          {{ f }}
        </label>
      </div>
    </div>
  </div>
</template>
