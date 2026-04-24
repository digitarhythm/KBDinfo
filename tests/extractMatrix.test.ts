import { describe, expect, it } from 'vitest'
import { parseMatrixLabel } from '../src/converter/extractMatrix'

describe('parseMatrixLabel', () => {
  it('"row,col" 形式を解析する', () => {
    expect(parseMatrixLabel('0,0')).toEqual([0, 0])
    expect(parseMatrixLabel('3, 12')).toEqual([3, 12])
    expect(parseMatrixLabel('10,25')).toEqual([10, 25])
  })

  it('最初の行のみを対象にする', () => {
    expect(parseMatrixLabel('0,0\nEsc')).toEqual([0, 0])
    expect(parseMatrixLabel('Esc\n0,0')).toBeNull()
  })

  it('K03 形式（2桁）を解析する', () => {
    expect(parseMatrixLabel('K03')).toEqual([0, 3])
    expect(parseMatrixLabel('k12')).toEqual([1, 2])
  })

  it('K0312 形式（4桁）を解析する', () => {
    expect(parseMatrixLabel('K0312')).toEqual([3, 12])
    expect(parseMatrixLabel('K0001')).toEqual([0, 1])
  })

  it('R2C5 形式を解析する', () => {
    expect(parseMatrixLabel('R2C5')).toEqual([2, 5])
    expect(parseMatrixLabel('r10c3')).toEqual([10, 3])
  })

  it('解析不能なラベルは null を返す', () => {
    expect(parseMatrixLabel('Esc')).toBeNull()
    expect(parseMatrixLabel('Q')).toBeNull()
    expect(parseMatrixLabel('')).toBeNull()
    expect(parseMatrixLabel(null)).toBeNull()
    expect(parseMatrixLabel(undefined)).toBeNull()
    expect(parseMatrixLabel('0,0,0')).toBeNull()
  })
})
