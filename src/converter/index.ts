import { parseKleRaw } from './parseKle'
import { buildLayout } from './buildLayout'
import { buildInfoJson } from './buildMetadata'
import { serializeInfoJson } from './serialize'
import type { InfoJson } from '../types/qmk'
import type { MatrixOverrides, MetadataFormState, Warning } from '../types/app'

export { parseKleRaw, KleParseError } from './parseKle'
export { parseMatrixLabel } from './extractMatrix'
export { buildLayout } from './buildLayout'
export { buildInfoJson, seedFromKle } from './buildMetadata'
export { serializeInfoJson } from './serialize'
export { WarningCollector, describeKind } from './warnings'

export interface ConvertResult {
  info: InfoJson
  json: string
  warnings: Warning[]
}

export const kleToInfoJson = (
  raw: string,
  metadata: MetadataFormState,
  overrides: MatrixOverrides = {},
): ConvertResult => {
  const keyboard = parseKleRaw(raw)
  const { layout, warnings } = buildLayout(keyboard, overrides)
  const info = buildInfoJson(metadata, layout)
  const json = serializeInfoJson(info)
  return { info, json, warnings }
}
