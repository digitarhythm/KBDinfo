import { Serial } from '@ijprest/kle-serial'
import type { KleKeyboard } from '../types/kle'

export class KleParseError extends Error {
  readonly cause: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'KleParseError'
    this.cause = cause
  }
}

export const parseKleRaw = (raw: string): KleKeyboard => {
  let rows: unknown
  try {
    rows = JSON.parse(raw)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new KleParseError(`JSON構文エラー: ${msg}`, e)
  }
  if (!Array.isArray(rows)) {
    throw new KleParseError('KLE raw は配列である必要があります')
  }
  try {
    return Serial.deserialize(rows)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new KleParseError(`KLE構造エラー: ${msg}`, e)
  }
}
