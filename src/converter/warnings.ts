import type { Warning, WarningKind } from '../types/app'

export class WarningCollector {
  private items: Warning[] = []

  add(kind: WarningKind, message: string, keyIndex?: number): void {
    this.items.push({ kind, message, keyIndex })
  }

  list(): Warning[] {
    return this.items.slice()
  }
}

export const describeKind = (kind: WarningKind): string => {
  switch (kind) {
    case 'unparsed-label': return 'ラベル未解析'
    case 'fallback-matrix': return 'matrixフォールバック'
    case 'dropped-secondary-rect': return '二次矩形ドロップ'
    case 'dropped-meta-field': return 'メタ情報ドロップ'
    case 'duplicate-matrix': return 'matrix重複'
    case 'parse-error': return 'パースエラー'
  }
}
