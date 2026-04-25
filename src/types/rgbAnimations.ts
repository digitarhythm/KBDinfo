// QMK RGB Matrix で利用可能な代表的なアニメーション一覧。
// すべて enable=true で出力対象。実際の対応はファーム側のリンク状況にも依存する。
export const RGB_MATRIX_ANIMATIONS = [
  // Solid / static
  'solid_color',
  // Mods / gradients
  'alphas_mods',
  'gradient_up_down',
  'gradient_left_right',
  // Breathing
  'breathing',
  // Bands
  'band_sat',
  'band_val',
  'band_pinwheel_sat',
  'band_pinwheel_val',
  'band_spiral_sat',
  'band_spiral_val',
  // Cycles
  'cycle_all',
  'cycle_left_right',
  'cycle_up_down',
  'cycle_out_in',
  'cycle_out_in_dual',
  'rainbow_moving_chevron',
  'cycle_pinwheel',
  'cycle_spiral',
  // Beacons
  'dual_beacon',
  'rainbow_beacon',
  'rainbow_pinwheels',
  // Drops
  'raindrops',
  'jellybean_raindrops',
  // Hue
  'hue_breathing',
  'hue_pendulum',
  'hue_wave',
  // Pixel
  'pixel_rain',
  'pixel_flow',
  'pixel_fractal',
  // Typing
  'typing_heatmap',
  'digital_rain',
  // Reactive
  'solid_reactive_simple',
  'solid_reactive',
  'solid_reactive_wide',
  'solid_reactive_multiwide',
  'solid_reactive_cross',
  'solid_reactive_multicross',
  'solid_reactive_nexus',
  'solid_reactive_multinexus',
  // Splash
  'splash',
  'multisplash',
  'solid_splash',
  'solid_multisplash',
  // Starlight
  'starlight',
  'starlight_dual_sat',
  'starlight_dual_hue',
  // Misc
  'riverflow',
] as const

export type RgbMatrixAnimationName = (typeof RGB_MATRIX_ANIMATIONS)[number]
