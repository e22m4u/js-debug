/**
 * To camel case.
 *
 * @param input
 */
export function toCamelCase(input) {
  return input
    .replace(/(^\w|[A-Z]|\b\w)/g, c => c.toUpperCase())
    .replace(/\W+/g, '')
    .replace(/(^\w)/g, c => c.toLowerCase());
}
