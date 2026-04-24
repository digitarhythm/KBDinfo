import { describe, expect, it } from 'vitest'
import { parseMatrixLabel } from '../src/converter/extractMatrix'

describe('parseMatrixLabel (row,col 形式のみ受理)', () => {
  it('"row,col" 形式を解析する', () => {
    expect(parseMatrixLabel('0,0')).toEqual([0, 0])
    expect(parseMatrixLabel('3, 12')).toEqual([3, 12])
    expect(parseMatrixLabel('10,25')).toEqual([10, 25])
    expect(parseMatrixLabel('  4 , 5  ')).toEqual([4, 5])
  })

  it('最初の行のみを対象にする', () => {
    expect(parseMatrixLabel('0,0\nEsc')).toEqual([0, 0])
    expect(parseMatrixLabel('Esc\n0,0')).toBeNull()
  })

  it('カンマ区切り以外の形式は null', () => {
    expect(parseMatrixLabel('K03')).toBeNull()
    expect(parseMatrixLabel('K0312')).toBeNull()
    expect(parseMatrixLabel('R2C5')).toBeNull()
    expect(parseMatrixLabel('Esc')).toBeNull()
    expect(parseMatrixLabel('Q')).toBeNull()
    expect(parseMatrixLabel('')).toBeNull()
    expect(parseMatrixLabel(null)).toBeNull()
    expect(parseMatrixLabel(undefined)).toBeNull()
    expect(parseMatrixLabel('0,0,0')).toBeNull()
    expect(parseMatrixLabel('0.5,1')).toBeNull()
  })
})
