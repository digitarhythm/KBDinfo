import type { MatrixCoord } from '../types/qmk'

export const parseMatrixLabel = (raw: string | undefined | null): MatrixCoord | null => {
  if (!raw) return null
  const head = raw.split('\n', 1)[0].trim()
  if (!head) return null

  // "row,col"
  const comma = /^(\d+)\s*,\s*(\d+)$/.exec(head)
  if (comma) return [Number(comma[1]), Number(comma[2])]

  // "R2C5" / "r10c3"
  const rc = /^[Rr](\d+)[Cc](\d+)$/.exec(head)
  if (rc) return [Number(rc[1]), Number(rc[2])]

  // "K0312" 4桁 → [03, 12]
  const k4 = /^[Kk](\d{2})(\d{2})$/.exec(head)
  if (k4) return [Number(k4[1]), Number(k4[2])]

  // "K03" 2桁 → [0, 3]
  const k2 = /^[Kk](\d)(\d)$/.exec(head)
  if (k2) return [Number(k2[1]), Number(k2[2])]

  return null
}
