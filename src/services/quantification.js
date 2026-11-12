import { i18n } from 'dwv';

// see doc/design/annotationList.md, 'Quantification details'

/**
 * Quantification keys related to pixel values, other keys are
 *   considered as geometric (lowercase, compared case insensitive).
 */
const pixelValueKeys = [
  'min', 'max', 'mean', 'stddev', 'median', 'p25', 'p75'
];

/**
 * Specific quantification labels (lowercase keys).
 */
const quantificationLabels = {
  stddev: 'standard deviation',
  surface: 'area'
};

/**
 * Specific quantification short labels (lowercase keys).
 */
const quantificationShortLabels = {
  surface: 'area'
};

/**
 * Get a readable label for a quantification key.
 *
 * @param {string} key The quantification key.
 * @returns {string} The label.
 */
export function getQuantificationLabel(key) {
  const specific = quantificationLabels[key.toLowerCase()];
  if (typeof specific !== 'undefined') {
    return specific;
  }
  // percentile: 'p25' -> '25th percentile'
  const percentile = key.match(/^p(\d+)$/);
  if (percentile !== null) {
    return `${percentile[1]}th percentile`;
  }
  // general rule: 'someKey' -> 'some key'
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

/**
 * Get a short label for a quantification key.
 *
 * @param {string} key The quantification key.
 * @returns {string} The short label.
 */
export function getQuantificationShortLabel(key) {
  const specific = quantificationShortLabels[key.toLowerCase()];
  if (typeof specific !== 'undefined') {
    return specific;
  }
  return key.toLowerCase();
}

/**
 * Format a quantification value with its unit.
 *
 * @param {number} value The value.
 * @param {string} [unit] The unit (translation key).
 * @returns {string} The formatted value.
 */
export function formatQuantificationValue(value, unit) {
  const absValue = Math.abs(value);
  let digits = 2;
  if (absValue >= 100) {
    digits = 1;
  } else if (absValue !== 0 && absValue < 1) {
    digits = 3;
  }
  let res = value.toFixed(digits);
  if (typeof unit !== 'undefined') {
    const unitStr = i18n.t(unit) ?? unit;
    // no space before degree symbol
    res += unitStr === '°' ? unitStr : ` ${unitStr}`;
  }
  return res;
}

/**
 * Quantification item.
 *
 * @typedef {object} QuantificationItem
 * @property {string} label The full label.
 * @property {string} shortLabel The short label.
 * @property {string} value The formatted value.
 */

/**
 * Quantification group.
 *
 * @typedef {object} QuantificationGroup
 * @property {string} title The group title.
 * @property {QuantificationItem[]} items The group items.
 */

/**
 * Get the quantification as groups of label and value pairs.
 *
 * @param {object|undefined} quantification The quantification.
 * @returns {QuantificationGroup[]} The non empty groups.
 */
export function getQuantificationGroups(quantification) {
  if (typeof quantification === 'undefined') {
    return [];
  }
  const pixelValues = {title: 'Pixel values', items: []};
  const geometry = {title: 'Geometry', items: []};
  for (const key of Object.keys(quantification)) {
    const quant = quantification[key];
    // skip undefined values (for ex surface on non calibrated data)
    if (typeof quant === 'undefined' || typeof quant.value !== 'number') {
      continue;
    }
    const item = {
      label: getQuantificationLabel(key),
      shortLabel: getQuantificationShortLabel(key),
      value: formatQuantificationValue(quant.value, quant.unit)
    };
    if (pixelValueKeys.includes(key.toLowerCase())) {
      pixelValues.items.push(item);
    } else {
      geometry.items.push(item);
    }
  }
  return [geometry, pixelValues].filter((group) => group.items.length !== 0);
}
