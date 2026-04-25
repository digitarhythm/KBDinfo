<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConverterStore } from '../stores/useConverterStore'
import { emptyEncoder, type RotaryEncoderForm } from '../types/app'
import { RGB_MATRIX_ANIMATIONS } from '../types/rgbAnimations'

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
    <!-- ============================================================ -->
    <!-- メタデータ -->
    <!-- ============================================================ -->
    <div class="panel">
      <div class="panel-title">🧾 メタデータ</div>
      <div
        v-if="metadata.notesFromKle"
        class="text-xs bg-blue-50 border border-blue-300 rounded p-2 mb-3 whitespace-pre-wrap"
      >
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
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- キーマトリクス -->
    <!-- ============================================================ -->
    <div class="panel">
      <div class="panel-title">⚙️ キーマトリクス</div>
      <div class="grid grid-cols-2 gap-2">
        <div class="col-span-2">
          <label class="label">matrix_pins.rows（カンマまたは空白区切り）</label>
          <input
            v-model="metadata.matrix_pins.rows"
            class="input"
            placeholder="例: F0, F1, F4, F5"
          />
        </div>
        <div class="col-span-2">
          <label class="label">matrix_pins.cols</label>
          <input
            v-model="metadata.matrix_pins.cols"
            class="input"
            placeholder="例: D0, D1, D2, D3, D4"
          />
        </div>
        <div>
          <label class="label">diode_direction</label>
          <select v-model="metadata.diode_direction" class="input">
            <option value="COL2ROW">COL2ROW</option>
            <option value="ROW2COL">ROW2COL</option>
          </select>
        </div>
        <div>
          <label class="label">debounce (ms)</label>
          <input
            v-model="metadata.debounce"
            type="number"
            min="0"
            class="input"
            placeholder="例: 5"
          />
        </div>
        <div>
          <label class="label">processor</label>
          <select v-model="metadata.processor" class="input">
            <option v-for="p in PROCESSORS" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div>
          <label class="label">bootloader</label>
          <select v-model="metadata.bootloader" class="input">
            <option v-for="b in BOOTLOADERS" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- オプション -->
    <!-- ============================================================ -->
    <div class="panel">
      <div class="panel-title">🎛️ オプション</div>
      <div class="text-xs text-slate-500 mb-1">features</div>
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

    <!-- ============================================================ -->
    <!-- ロータリーエンコーダー -->
    <!-- ============================================================ -->
    <div class="panel">
      <div class="panel-title">
        🔄 ロータリーエンコーダー
        <button
          type="button"
          class="btn text-xs ml-auto"
          @click="addEncoder(metadata.encoder_rotary)"
        >
          + 追加
        </button>
      </div>
      <p
        v-if="metadata.encoder_rotary.length === 0"
        class="text-xs text-slate-500"
      >
        エンコーダーはありません。「+ 追加」で行を追加してください。
      </p>
      <div
        v-for="(enc, idx) in metadata.encoder_rotary"
        :key="idx"
        class="grid grid-cols-12 gap-1 mb-1 items-center"
      >
        <input
          v-model="enc.pin_a"
          class="input col-span-4"
          placeholder="pin_a 例: GP0"
        />
        <input
          v-model="enc.pin_b"
          class="input col-span-4"
          placeholder="pin_b 例: GP1"
        />
        <input
          v-model="enc.resolution"
          type="number"
          min="1"
          class="input col-span-3"
          placeholder="res"
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

    <!-- ============================================================ -->
    <!-- RGBマトリクス -->
    <!-- ============================================================ -->
    <div class="panel">
      <div class="panel-title">
        💡 RGBマトリクス
        <label class="inline-flex items-center gap-1 text-sm font-normal ml-auto">
          <input type="checkbox" v-model="metadata.rgb_matrix.enabled" />
          enabled
        </label>
      </div>

      <div v-if="metadata.rgb_matrix.enabled" class="space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">driver</label>
            <select v-model="metadata.rgb_matrix.driver" class="input">
              <option v-for="d in RGB_DRIVERS" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div>
            <label class="label">led_count</label>
            <input
              v-model="metadata.rgb_matrix.led_count"
              type="number"
              min="0"
              class="input"
              placeholder="例: 87"
            />
          </div>
          <div v-if="metadata.rgb_matrix.driver === 'ws2812'" class="col-span-2">
            <label class="label">ws2812.pin</label>
            <input
              v-model="metadata.rgb_matrix.ws2812_pin"
              class="input"
              placeholder="例: GP1"
            />
          </div>
          <div>
            <label class="label">max_brightness</label>
            <input
              v-model="metadata.rgb_matrix.max_brightness"
              type="number"
              min="0"
              max="255"
              class="input"
              placeholder="0–255"
            />
          </div>
          <div>
            <label class="label">timeout (ms)</label>
            <input
              v-model="metadata.rgb_matrix.timeout"
              type="number"
              min="0"
              class="input"
              placeholder="例: 0"
            />
          </div>
          <div class="col-span-2">
            <label class="inline-flex items-center gap-1 text-sm">
              <input type="checkbox" v-model="metadata.rgb_matrix.sleep" />
              sleep（USBサスペンド時にLED OFF）
            </label>
          </div>
          <div>
            <label class="label">hue_steps</label>
            <input v-model="metadata.rgb_matrix.hue_steps" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">sat_steps</label>
            <input v-model="metadata.rgb_matrix.sat_steps" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">val_steps</label>
            <input v-model="metadata.rgb_matrix.val_steps" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">speed_steps</label>
            <input v-model="metadata.rgb_matrix.speed_steps" type="number" min="1" class="input" />
          </div>
        </div>

        <div class="pt-2">
          <div class="text-xs font-semibold text-slate-600 mb-1">default（電源投入時の状態）</div>
          <div class="grid grid-cols-5 gap-1">
            <div class="col-span-5">
              <label class="label">animation</label>
              <select v-model="metadata.rgb_matrix.default_animation" class="input">
                <option value="">（未設定）</option>
                <option v-for="a in RGB_MATRIX_ANIMATIONS" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <div>
              <label class="label">hue</label>
              <input
                v-model="metadata.rgb_matrix.default_hue"
                type="number"
                min="0"
                max="255"
                class="input"
              />
            </div>
            <div>
              <label class="label">sat</label>
              <input
                v-model="metadata.rgb_matrix.default_sat"
                type="number"
                min="0"
                max="255"
                class="input"
              />
            </div>
            <div>
              <label class="label">val</label>
              <input
                v-model="metadata.rgb_matrix.default_val"
                type="number"
                min="0"
                max="255"
                class="input"
              />
            </div>
            <div>
              <label class="label">speed</label>
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
            <div class="text-xs font-semibold text-slate-600">animations（有効化するもの）</div>
            <div class="flex gap-1">
              <button type="button" class="btn text-xs" @click="toggleAllAnimations(true)">
                全ON
              </button>
              <button type="button" class="btn text-xs" @click="toggleAllAnimations(false)">
                全OFF
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
            <label class="label">split_count.left</label>
            <input
              v-model="metadata.rgb_matrix.split_count_left"
              type="number"
              min="0"
              class="input"
              placeholder="左LED数"
            />
          </div>
          <div>
            <label class="label">split_count.right</label>
            <input
              v-model="metadata.rgb_matrix.split_count_right"
              type="number"
              min="0"
              class="input"
              placeholder="右LED数"
            />
          </div>
        </div>
        <p v-else class="text-xs text-slate-400 pt-2">
          split_count は「分割キーボード設定」を enabled にすると表示されます
        </p>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- 分割キーボード設定 -->
    <!-- ============================================================ -->
    <div class="panel">
      <div class="panel-title">
        🔗 分割キーボード設定
        <label class="inline-flex items-center gap-1 text-sm font-normal ml-auto">
          <input type="checkbox" v-model="metadata.split.enabled" />
          enabled
        </label>
      </div>

      <div v-if="metadata.split.enabled" class="space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div class="col-span-2">
            <label class="label">bootmagic.matrix（row,col 形式）</label>
            <input
              v-model="metadata.split.bootmagic_matrix"
              class="input"
              placeholder="例: 4, 5"
            />
          </div>
          <div class="col-span-2">
            <label class="label">handedness.pin</label>
            <input
              v-model="metadata.split.handedness_pin"
              class="input"
              placeholder="例: GP20"
            />
          </div>
          <div class="col-span-2">
            <label class="label">split.matrix_pins.right.rows</label>
            <input
              v-model="metadata.split.matrix_pins_right_rows"
              class="input"
              placeholder="例: GP4, GP5, GP6, GP7"
            />
          </div>
          <div class="col-span-2">
            <label class="label">split.matrix_pins.right.cols</label>
            <input
              v-model="metadata.split.matrix_pins_right_cols"
              class="input"
              placeholder="例: GP0, GP1, GP2"
            />
          </div>
          <div>
            <label class="label">serial.driver</label>
            <input
              v-model="metadata.split.serial_driver"
              class="input"
              placeholder="vendor"
            />
          </div>
          <div>
            <label class="label">serial.pin</label>
            <input
              v-model="metadata.split.serial_pin"
              class="input"
              placeholder="例: GP1"
            />
          </div>
        </div>

        <div class="pt-2">
          <div class="flex items-center justify-between mb-1">
            <div class="text-xs font-semibold text-slate-600">
              split.encoder.right.rotary
            </div>
            <button
              type="button"
              class="btn text-xs"
              @click="addEncoder(metadata.split.encoder_right_rotary)"
            >
              + 追加
            </button>
          </div>
          <p
            v-if="metadata.split.encoder_right_rotary.length === 0"
            class="text-xs text-slate-500"
          >
            右側のエンコーダーはありません。
          </p>
          <div
            v-for="(enc, idx) in metadata.split.encoder_right_rotary"
            :key="idx"
            class="grid grid-cols-12 gap-1 mb-1 items-center"
          >
            <input v-model="enc.pin_a" class="input col-span-4" placeholder="pin_a" />
            <input v-model="enc.pin_b" class="input col-span-4" placeholder="pin_b" />
            <input
              v-model="enc.resolution"
              type="number"
              min="1"
              class="input col-span-3"
              placeholder="res"
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
