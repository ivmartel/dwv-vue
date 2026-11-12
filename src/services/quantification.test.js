import { describe, expect, test } from 'vitest'
import {
  formatQuantificationValue,
  getQuantificationGroups,
  getQuantificationLabel,
  getQuantificationShortLabel
} from './quantification.js'

describe('quantification', () => {
  test('labels', () => {
    expect(getQuantificationLabel('stddev')).toBe('standard deviation')
    expect(getQuantificationLabel('surface')).toBe('area')
    expect(getQuantificationLabel('p25')).toBe('25th percentile')
    expect(getQuantificationLabel('someKey')).toBe('some key')
    expect(getQuantificationShortLabel('surface')).toBe('area')
    expect(getQuantificationShortLabel('stdDev')).toBe('stddev')
  })

  test('value format', () => {
    expect(formatQuantificationValue(123.456)).toBe('123.5')
    expect(formatQuantificationValue(12.3456)).toBe('12.35')
    expect(formatQuantificationValue(0.12345)).toBe('0.123')
    expect(formatQuantificationValue(0)).toBe('0.00')
    expect(formatQuantificationValue(-0.5)).toBe('-0.500')
  })

  test('groups', () => {
    expect(getQuantificationGroups(undefined)).toEqual([])
    const groups = getQuantificationGroups({
      min: {value: 1},
      length: {value: 10},
      surface: undefined,
      other: {value: 'a'}
    })
    expect(groups.map((group) => group.title))
      .toEqual(['Geometry', 'Pixel values'])
    expect(groups[0].items.map((item) => item.shortLabel)).toEqual(['length'])
    expect(groups[1].items.map((item) => item.shortLabel)).toEqual(['min'])
    expect(getQuantificationGroups({min: undefined})).toEqual([])
  })
})
