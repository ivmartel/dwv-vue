// panel widths, see doc/design/rightPanel.md

/**
 * Initial panel width in pixels.
 */
export const PANEL_INITIAL_WIDTH = 300;
/**
 * Minimum panel width in pixels.
 */
export const PANEL_MIN_WIDTH = 200;
/**
 * Maximum panel width as a ratio of the window width.
 */
export const PANEL_MAX_WIDTH_RATIO = 0.5;
/**
 * Keyboard resize step in pixels.
 */
export const PANEL_KEY_STEP = 20;

/**
 * Get the maximum panel width: 50% of the window width, rounded,
 * and never below the minimum width.
 *
 * @param {number} windowWidth The window width in pixels.
 * @returns {number} The maximum width in pixels.
 */
export function getMaxPanelWidth(windowWidth) {
  return Math.max(
    PANEL_MIN_WIDTH, Math.round(windowWidth * PANEL_MAX_WIDTH_RATIO));
}

/**
 * Round and clamp a panel width to the width limits.
 *
 * @param {number} width The input width in pixels.
 * @param {number} windowWidth The window width in pixels.
 * @returns {number} The clamped width in pixels.
 */
export function clampPanelWidth(width, windowWidth) {
  return Math.min(
    getMaxPanelWidth(windowWidth),
    Math.max(PANEL_MIN_WIDTH, Math.round(width)));
}

/**
 * Get the panel width resulting from a resize key press.
 *
 * @param {string} key The keyboard event key.
 * @param {number} width The current width in pixels.
 * @param {number} windowWidth The window width in pixels.
 * @returns {number|undefined} The new width in pixels (clamped),
 *   undefined if the key is not a resize key.
 */
export function getKeyResizeWidth(key, width, windowWidth) {
  let newWidth;
  if (key === 'ArrowLeft') {
    newWidth = width + PANEL_KEY_STEP;
  } else if (key === 'ArrowRight') {
    newWidth = width - PANEL_KEY_STEP;
  } else if (key === 'Home') {
    newWidth = PANEL_MIN_WIDTH;
  } else if (key === 'End') {
    newWidth = getMaxPanelWidth(windowWidth);
  }
  if (typeof newWidth === 'undefined') {
    return undefined;
  }
  return clampPanelWidth(newWidth, windowWidth);
}
