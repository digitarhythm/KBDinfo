<script setup lang="ts">
import { computed } from 'vue'
import type { KleKey } from '../types/kle'
import { KEY_UNIT_PX, contrastTextColor } from '../composables/useSvgGeometry'

interface Props {
  k: KleKey
  originalIndex: number
  selected: boolean
  invalid?: boolean
  duplicate?: boolean
  deleted?: boolean
  // override が設定されているとき表示する文字列（matrix エディタ反映表示用）
  overrideLabel?: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'select', idx: number): void }>()

const U = KEY_UNIT_PX
const primary = computed(() => ({
  x: props.k.x * U,
  y: props.k.y * U,
  w: props.k.width * U,
  h: props.k.height * U,
}))

const hasSecondary = computed(() => {
  return (
    props.k.width2 !== props.k.width ||
    props.k.height2 !== props.k.height ||
    props.k.x2 !== 0 ||
    props.k.y2 !== 0
  )
})

const secondary = computed(() => ({
  x: (props.k.x + props.k.x2) * U,
  y: (props.k.y + props.k.y2) * U,
  w: props.k.width2 * U,
  h: props.k.height2 * U,
}))

const rotateTransform = computed(() =>
  props.k.rotation_angle !== 0
    ? `rotate(${props.k.rotation_angle} ${props.k.rotation_x * U} ${props.k.rotation_y * U})`
    : undefined,
)

const fill = computed(() => {
  if (props.invalid) return '#fecaca' // red-200: matrix ソース不正
  if (props.duplicate) return '#fef08a' // yellow-200: matrix 値が重複
  return props.k.color || '#cccccc'
})
const textColor = computed(() => contrastTextColor(fill.value))
const strokeColor = computed(() => {
  if (props.selected) return '#2563eb'
  if (props.invalid) return '#dc2626' // red-600
  if (props.duplicate) return '#ca8a04' // yellow-600
  return '#334155'
})
const strokeWidth = computed(() => {
  if (props.selected) return 3
  if (props.invalid || props.duplicate) return 2
  return 1
})
const opacity = computed(() => {
  if (props.deleted) return 0.3
  if (props.k.decal) return 0.45
  if (props.k.ghost) return 0.35
  return 1
})
const isDashed = computed(() => props.k.decal || props.deleted)
// override があればそれを表示、無ければ KLE ラベル先頭行をそのまま表示
const displayText = computed(() => {
  if (props.overrideLabel) return props.overrideLabel
  const head = (props.k.labels[0] ?? '').split('\n', 1)[0] ?? ''
  return head
})
</script>

<template>
  <g
    :transform="rotateTransform"
    :opacity="opacity"
    :data-kle-key="originalIndex"
    style="cursor: pointer"
    @click="emit('select', originalIndex)"
  >
    <rect
      v-if="hasSecondary"
      :x="secondary.x"
      :y="secondary.y"
      :width="secondary.w"
      :height="secondary.h"
      :fill="fill"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      :stroke-dasharray="isDashed ? '4 4' : undefined"
      :data-kle-key="originalIndex"
      rx="4"
    />
    <rect
      :x="primary.x"
      :y="primary.y"
      :width="primary.w"
      :height="primary.h"
      :fill="fill"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      :stroke-dasharray="isDashed ? '4 4' : undefined"
      :data-kle-key="originalIndex"
      rx="4"
    />
    <text
      v-if="!k.decal && displayText"
      :x="primary.x + 5"
      :y="primary.y + 14"
      :fill="textColor"
      font-size="11"
      font-weight="600"
      font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
      style="pointer-events: none"
    >
      {{ displayText }}
    </text>
    <text
      v-if="deleted"
      :x="primary.x + primary.w / 2"
      :y="primary.y + primary.h - 4"
      :fill="textColor"
      font-size="9"
      font-style="italic"
      text-anchor="middle"
      style="pointer-events: none"
    >
      deleted
    </text>
  </g>
</template>
