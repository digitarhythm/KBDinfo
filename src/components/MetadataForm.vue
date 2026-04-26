<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useConverterStore } from '../stores/useConverterStore'
import { emptyEncoder, type RotaryEncoderForm } from '../types/app'
import { RGB_MATRIX_ANIMATIONS } from '../types/rgbAnimations'

const store = useConverterStore()
const { metadata } = storeToRefs(store)
const { t } = useI18n()

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

const RGB_DRIVERS = ['ws2812', 'is31fl3733', 'is31fl3741', 'aw20216s', 'custom']

const addEncoder = (list: RotaryEncoderForm[]): void => {
  list.push(emptyEncoder())
}
const removeEncoder = (list: RotaryEncoderForm[], idx: number): void => {
  list.splice(idx, 1)
}

const toggleAllAnimations = (value: boolean): void => {
  const next: Record<string, boolean> = {}
  for (const a of RGB_MATRIX_ANIMATIONS) next[a] = value
  metadata.value.rgb_matrix.animations = next
}
</script>

<template>
  <div class="space-y-4">
    <!-- メタデータ -->
    <div class="panel">
      <div class="panel-title">{{ t('metadata.title') }}</div>
      <div
        v-if="metadata.notesFromKle"
        class="text-xs bg-blue-50 border border-blue-300 rounded p-2 mb-3 whitespace-pre-wrap"
      >
        <span class="font-semibold">{{ t('metadata.kleNotes') }}</span> {{ metadata.notesFromKle }}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="col-span-2">
          <label class="label">{{ t('metadata.keyboardName') }}</label>
          <input v-model="metadata.keyboard_name" class="input" />
        </div>
        <div>
          <label class="label">{{ t('metadata.manufacturer') }}</label>
          <input v-model="metadata.manufacturer" class="input" />
        </div>
        <div>
          <label class="label">{{ t('metadata.maintainer') }}</label>
          <input v-model="metadata.maintainer" class="input" />
        </div>
        <div class="col-span-2">
          <label class="label">{{ t('metadata.url') }}</label>
          <input v-model="metadata.url" class="input" />
        </div>
        <div>
          <label class="label">{{ t('metadata.usbVid') }}</label>
          <input v-model="metadata.usb.vid" class="input" placeholder="0xFEED" />
        </div>
        <div>
          <label class="label">{{ t('metadata.usbPid') }}</label>
          <input v-model="metadata.usb.pid" class="input" placeholder="0x0000" />
        </div>
        <div class="col-span-2">
          <label class="label">{{ t('metadata.deviceVersion') }}</label>
          <input v-model="metadata.usb.device_version" class="input" placeholder="0.0.1" />
        </div>
      </div>
    </div>

    <!-- キーマトリクス -->
    <div class="panel">
      <div class="panel-title">{{ t('keyMatrix.title') }}</div>
      <div class="grid grid-cols-2 gap-2">
        <div class="col-span-2">
          <label class="label">{{ t('keyMatrix.rowsLabel') }}</label>
          <input
            v-model="metadata.matrix_pins.rows"
            class="input"
            :placeholder="t('keyMatrix.rowsPlaceholder')"
          />
        </div>
        <div class="col-span-2">
          <label class="label">{{ t('keyMatrix.cols') }}</label>
          <input
            v-model="metadata.matrix_pins.cols"
            class="input"
            :placeholder="t('keyMatrix.colsPlaceholder')"
          />
        </div>
        <div>
          <label class="label">{{ t('keyMatrix.diodeDirection') }}</label>
          <select v-model="metadata.diode_direction" class="input">
            <option value="COL2ROW">COL2ROW</option>
            <option value="ROW2COL">ROW2COL</option>
          </select>
        </div>
        <div>
          <label class="label">{{ t('keyMatrix.debounce') }}</label>
          <input
            v-model="metadata.debounce"
            type="number"
            min="0"
            class="input"
            :placeholder="t('keyMatrix.debouncePlaceholder')"
          />
        </div>
        <div>
          <label class="label">{{ t('keyMatrix.processor') }}</label>
          <select v-model="metadata.processor" class="input">
            <option v-for="p in PROCESSORS" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div>
          <label class="label">{{ t('keyMatrix.bootloader') }}</label>
          <select v-model="metadata.bootloader" class="input">
            <option v-for="b in BOOTLOADERS" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- オプション -->
    <div class="panel">
      <div class="panel-title">{{ t('options.title') }}</div>
      <div class="text-xs text-slate-500 mb-1">{{ t('options.features') }}</div>
      <div class="grid grid-cols-3 gap-1 text-sm">
        <label
          v-for="f in FEATURE_KEYS"
          :key="f"
          class="inline-flex items-center gap-1"
        >
          <input type="checkbox" v-model="metadata.features[f]" />
          {{ f }}
        </label>
      </div>
    </div>

    <!-- ロータリーエンコーダー -->
    <div class="panel">
      <div class="panel-title">
        {{ t('encoder.title') }}
        <button
          type="button"
          class="btn text-xs ml-auto"
          @click="addEncoder(metadata.encoder_rotary)"
        >
          {{ t('encoder.add') }}
        </button>
      </div>
      <p
        v-if="metadata.encoder_rotary.length === 0"
        class="text-xs text-slate-500"
      >
        {{ t('encoder.empty') }}
      </p>
      <div
        v-for="(enc, idx) in metadata.encoder_rotary"
        :key="idx"
        class="grid grid-cols-12 gap-1 mb-1 items-center"
      >
        <input
          v-model="enc.pin_a"
          class="input col-span-4"
          :placeholder="t('encoder.pinAPlaceholder')"
        />
        <input
          v-model="enc.pin_b"
          class="input col-span-4"
          :placeholder="t('encoder.pinBPlaceholder')"
        />
        <input
          v-model="enc.resolution"
          type="number"
          min="1"
          class="input col-span-3"
          :placeholder="t('encoder.resolutionPlaceholder')"
        />
        <button
          type="button"
          class="btn col-span-1 px-2 border-red-300 text-red-700 hover:bg-red-50"
          @click="removeEncoder(metadata.encoder_rotary, idx)"
        >
          ×
        </button>
      </div>
    </div>

    <!-- RGBマトリクス -->
    <div class="panel">
      <div class="panel-title">
        {{ t('rgbMatrix.title') }}
        <label class="inline-flex items-center gap-1 text-sm font-normal ml-auto">
          <input type="checkbox" v-model="metadata.rgb_matrix.enabled" />
          {{ t('rgbMatrix.enabled') }}
        </label>
      </div>

      <div v-if="metadata.rgb_matrix.enabled" class="space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">{{ t('rgbMatrix.driver') }}</label>
            <select v-model="metadata.rgb_matrix.driver" class="input">
              <option v-for="d in RGB_DRIVERS" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.ledCount') }}</label>
            <input
              v-model="metadata.rgb_matrix.led_count"
              type="number"
              min="0"
              class="input"
              :placeholder="t('rgbMatrix.ledCountPlaceholder')"
            />
          </div>
          <div v-if="metadata.rgb_matrix.driver === 'ws2812'" class="col-span-2">
            <label class="label">{{ t('rgbMatrix.ws2812Pin') }}</label>
            <input
              v-model="metadata.rgb_matrix.ws2812_pin"
              class="input"
              :placeholder="t('rgbMatrix.ws2812PinPlaceholder')"
            />
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.maxBrightness') }}</label>
            <input
              v-model="metadata.rgb_matrix.max_brightness"
              type="number"
              min="0"
              max="255"
              class="input"
              :placeholder="t('rgbMatrix.maxBrightnessPlaceholder')"
            />
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.timeout') }}</label>
            <input
              v-model="metadata.rgb_matrix.timeout"
              type="number"
              min="0"
              class="input"
              :placeholder="t('rgbMatrix.timeoutPlaceholder')"
            />
          </div>
          <div class="col-span-2">
            <label class="inline-flex items-center gap-1 text-sm">
              <input type="checkbox" v-model="metadata.rgb_matrix.sleep" />
              {{ t('rgbMatrix.sleepLabel') }}
            </label>
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.hueSteps') }}</label>
            <input v-model="metadata.rgb_matrix.hue_steps" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.satSteps') }}</label>
            <input v-model="metadata.rgb_matrix.sat_steps" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.valSteps') }}</label>
            <input v-model="metadata.rgb_matrix.val_steps" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.speedSteps') }}</label>
            <input v-model="metadata.rgb_matrix.speed_steps" type="number" min="1" class="input" />
          </div>
        </div>

        <div class="pt-2">
          <div class="text-xs font-semibold text-slate-600 mb-1">{{ t('rgbMatrix.defaultTitle') }}</div>
          <div class="grid grid-cols-5 gap-1">
            <div class="col-span-5">
              <label class="label">{{ t('rgbMatrix.animation') }}</label>
              <select v-model="metadata.rgb_matrix.default_animation" class="input">
                <option value="">{{ t('rgbMatrix.animationNotSet') }}</option>
                <option v-for="a in RGB_MATRIX_ANIMATIONS" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <div>
              <label class="label">{{ t('rgbMatrix.hue') }}</label>
              <input
                v-model="metadata.rgb_matrix.default_hue"
                type="number"
                min="0"
                max="255"
                class="input"
              />
            </div>
            <div>
              <label class="label">{{ t('rgbMatrix.sat') }}</label>
              <input
                v-model="metadata.rgb_matrix.default_sat"
                type="number"
                min="0"
                max="255"
                class="input"
              />
            </div>
            <div>
              <label class="label">{{ t('rgbMatrix.val') }}</label>
              <input
                v-model="metadata.rgb_matrix.default_val"
                type="number"
                min="0"
                max="255"
                class="input"
              />
            </div>
            <div>
              <label class="label">{{ t('rgbMatrix.speed') }}</label>
              <input
                v-model="metadata.rgb_matrix.default_speed"
                type="number"
                min="0"
                max="255"
                class="input"
              />
            </div>
          </div>
        </div>

        <div class="pt-2">
          <div class="flex items-center justify-between mb-1">
            <div class="text-xs font-semibold text-slate-600">{{ t('rgbMatrix.animationsTitle') }}</div>
            <div class="flex gap-1">
              <button type="button" class="btn text-xs" @click="toggleAllAnimations(true)">
                {{ t('rgbMatrix.enableAll') }}
              </button>
              <button type="button" class="btn text-xs" @click="toggleAllAnimations(false)">
                {{ t('rgbMatrix.disableAll') }}
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
            <label
              v-for="a in RGB_MATRIX_ANIMATIONS"
              :key="a"
              class="inline-flex items-center gap-1"
            >
              <input
                type="checkbox"
                :checked="metadata.rgb_matrix.animations[a] === true"
                @change="
                  metadata.rgb_matrix.animations[a] = ($event.target as HTMLInputElement).checked
                "
              />
              <span class="font-mono">{{ a }}</span>
            </label>
          </div>
        </div>

        <!-- split_count は分割キーボード enabled の時のみ表示 -->
        <div v-if="metadata.split.enabled" class="pt-2 grid grid-cols-2 gap-2">
          <div>
            <label class="label">{{ t('rgbMatrix.splitCountLeft') }}</label>
            <input
              v-model="metadata.rgb_matrix.split_count_left"
              type="number"
              min="0"
              class="input"
              :placeholder="t('rgbMatrix.splitCountLeftPlaceholder')"
            />
          </div>
          <div>
            <label class="label">{{ t('rgbMatrix.splitCountRight') }}</label>
            <input
              v-model="metadata.rgb_matrix.split_count_right"
              type="number"
              min="0"
              class="input"
              :placeholder="t('rgbMatrix.splitCountRightPlaceholder')"
            />
          </div>
        </div>
        <p v-else class="text-xs text-slate-400 pt-2">
          {{ t('rgbMatrix.splitCountHint') }}
        </p>
      </div>
    </div>

    <!-- 分割キーボード設定 -->
    <div class="panel">
      <div class="panel-title">
        {{ t('split.title') }}
        <label class="inline-flex items-center gap-1 text-sm font-normal ml-auto">
          <input type="checkbox" v-model="metadata.split.enabled" />
          {{ t('split.enabled') }}
        </label>
      </div>

      <div v-if="metadata.split.enabled" class="space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div class="col-span-2">
            <label class="label">{{ t('split.bootmagicMatrix') }}</label>
            <input
              v-model="metadata.split.bootmagic_matrix"
              class="input"
              :placeholder="t('split.bootmagicMatrixPlaceholder')"
            />
          </div>
          <div class="col-span-2">
            <label class="label">{{ t('split.handednessPin') }}</label>
            <input
              v-model="metadata.split.handedness_pin"
              class="input"
              :placeholder="t('split.handednessPinPlaceholder')"
            />
          </div>
          <div class="col-span-2">
            <label class="label">{{ t('split.matrixPinsRightRows') }}</label>
            <input
              v-model="metadata.split.matrix_pins_right_rows"
              class="input"
              :placeholder="t('split.matrixPinsRightRowsPlaceholder')"
            />
          </div>
          <div class="col-span-2">
            <label class="label">{{ t('split.matrixPinsRightCols') }}</label>
            <input
              v-model="metadata.split.matrix_pins_right_cols"
              class="input"
              :placeholder="t('split.matrixPinsRightColsPlaceholder')"
            />
          </div>
          <div>
            <label class="label">{{ t('split.serialDriver') }}</label>
            <input
              v-model="metadata.split.serial_driver"
              class="input"
              :placeholder="t('split.serialDriverPlaceholder')"
            />
          </div>
          <div>
            <label class="label">{{ t('split.serialPin') }}</label>
            <input
              v-model="metadata.split.serial_pin"
              class="input"
              :placeholder="t('split.serialPinPlaceholder')"
            />
          </div>
        </div>

        <div class="pt-2">
          <div class="flex items-center justify-between mb-1">
            <div class="text-xs font-semibold text-slate-600">
              {{ t('split.encoderRightTitle') }}
            </div>
            <button
              type="button"
              class="btn text-xs"
              @click="addEncoder(metadata.split.encoder_right_rotary)"
            >
              {{ t('encoder.add') }}
            </button>
          </div>
          <p
            v-if="metadata.split.encoder_right_rotary.length === 0"
            class="text-xs text-slate-500"
          >
            {{ t('split.encoderRightEmpty') }}
          </p>
          <div
            v-for="(enc, idx) in metadata.split.encoder_right_rotary"
            :key="idx"
            class="grid grid-cols-12 gap-1 mb-1 items-center"
          >
            <input v-model="enc.pin_a" class="input col-span-4" :placeholder="t('encoder.pinAPlaceholder')" />
            <input v-model="enc.pin_b" class="input col-span-4" :placeholder="t('encoder.pinBPlaceholder')" />
            <input
              v-model="enc.resolution"
              type="number"
              min="1"
              class="input col-span-3"
              :placeholder="t('encoder.resolutionPlaceholder')"
            />
            <button
              type="button"
              class="btn col-span-1 px-2 border-red-300 text-red-700 hover:bg-red-50"
              @click="removeEncoder(metadata.split.encoder_right_rotary, idx)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
