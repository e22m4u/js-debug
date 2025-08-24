/**
 * Экранирует специальные символы в строке для использования в регулярном выражении.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeRegexp(str) {
  // $& означает всю совпавшую строку.
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
