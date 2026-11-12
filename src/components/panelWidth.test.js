import { describe, expect, test } from 'vitest'
import {
  PANEL_MIN_WIDTH,
  clampPanelWidth,
  getKeyResizeWidth,
  getMaxPanelWidth
} from './panelWidth.js'

describe('panelWidth', () => {
  test('max width is half the window, never below the min', () => {
    expect(getMaxPanelWidth(1001)).toBe(501)
    expect(getMaxPanelWidth(300)).toBe(PANEL_MIN_WIDTH)
  })

  test('clamps and rounds', () => {
    expect(clampPanelWidth(250.4, 1000)).toBe(250)
    expect(clampPanelWidth(10, 1000)).toBe(PANEL_MIN_WIDTH)
    expect(clampPanelWidth(900, 1000)).toBe(500)
  })

  test('keyboard resize', () => {
    expect(getKeyResizeWidth('ArrowLeft', 300, 1000)).toBe(320)
    expect(getKeyResizeWidth('ArrowRight', 300, 1000)).toBe(280)
    expect(getKeyResizeWidth('Home', 300, 1000)).toBe(PANEL_MIN_WIDTH)
    expect(getKeyResizeWidth('End', 300, 1000)).toBe(500)
    expect(getKeyResizeWidth('ArrowRight', 210, 1000)).toBe(PANEL_MIN_WIDTH)
    expect(getKeyResizeWidth('a', 300, 1000)).toBeUndefined()
  })
})
