/**
 * Material icon names of the annotation shapes (lowercase shape names).
 */
const shapeIcons = {
  ruler: 'straighten',
  arrow: 'call_made',
  rectangle: 'crop_landscape',
  circle: 'radio_button_unchecked',
  ellipse: 'sports_rugby',
  protractor: 'square_foot',
  roi: 'polyline'
};

/**
 * Get the icon name of an annotation shape.
 *
 * @param {string} shapeName The shape name (case insensitive).
 * @returns {string} The icon name, a question mark for unknown shapes.
 */
export function getShapeIcon(shapeName) {
  return shapeIcons[shapeName?.toLowerCase()] ?? 'question_mark';
}
