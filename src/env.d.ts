/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@ijprest/kle-serial' {
  export interface KeyboardMetadata {
    author?: string
    backcolor?: string
    background?: { name?: string; style?: string }
    name?: string
    notes?: string
    radii?: string
    switchBrand?: string
    switchMount?: string
    switchType?: string
    pcb?: boolean
    plate?: boolean
    css?: string
  }

  export interface Key {
    color: string
    labels: string[]
    textColor: Array<string | undefined>
    textSize: Array<number | undefined>
    default: { textColor: string; textSize: number }
    x: number
    y: number
    width: number
    height: number
    x2: number
    y2: number
    width2: number
    height2: number
    rotation_x: number
    rotation_y: number
    rotation_angle: number
    decal: boolean
    ghost: boolean
    stepped: boolean
    nub: boolean
    profile: string
    sm: string
    sb: string
    st: string
  }

  export interface Keyboard {
    meta: KeyboardMetadata
    keys: Key[]
  }

  export namespace Serial {
    function deserialize(rows: unknown[]): Keyboard
    function parse(json: string): Keyboard
    function serialize(keyboard: Keyboard): unknown[]
  }
}
