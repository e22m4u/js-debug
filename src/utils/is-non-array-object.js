/**
 * Is non-array object.
 *
 * @param input
 */
export function isNonArrayObject(input) {
  return Boolean(input && typeof input === 'object' && !Array.isArray(input));
}
