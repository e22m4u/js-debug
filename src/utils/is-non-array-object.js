/**
 * Is non-array object.
 *
 * @param {*} input
 * @returns {boolean}
 */
export function isNonArrayObject(input) {
  return Boolean(input && typeof input === 'object' && !Array.isArray(input));
}
