import {inspect} from 'util';

/**
 * Опции утилиты inspect для дампа объектов.
 *
 * @type {object}
 */
export const INSPECT_OPTIONS = {
  showHidden: false,
  depth: null,
  colors: true,
  compact: false,
};

/**
 * Create colorized dump.
 *
 * @param {*} value
 * @returns {string}
 */
export function createColorizedDump(value) {
  return inspect(value, INSPECT_OPTIONS);
}
