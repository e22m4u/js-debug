import {toCamelCase} from './utils/index.js';
import {createDebugger} from '@e22m4u/js-debug';

/**
 * @typedef {{
 *   namespace: string,
 *   noEnvNs: boolean,
 *   noInstMsg: boolean,
 * }} DebuggableOptions
 */

/**
 * Debuggable.
 */
export class Debuggable {
  /**
   * Instantiation message;
   *
   * @type {string}
   */
  static INSTANTIATION_MESSAGE = 'Instantiated.';

  /**
   * Debug.
   *
   * @type {Function}
   */
  debug;

  /**
   * Ctor Debug.
   *
   * @type {Function}
   */
  ctorDebug;

  /**
   * Возвращает функцию-отладчик с сегментом пространства имен
   * указанного в параметре метода.
   *
   * @param {Function} method
   * @returns {Function}
   */
  getDebuggerFor(method) {
    return this.debug.withHash().withNs(method.name);
  }

  /**
   * Constructor.
   *
   * @param {object|undefined} container
   * @param {DebuggableOptions|undefined} options
   */
  constructor(options = undefined) {
    const className = toCamelCase(this.constructor.name);
    options = (typeof options === 'object' && options) || {};
    // кроме переменной окружения DEBUGGER_NAMESPACE,
    // пространство имен можно определить опцией "namespace"
    const namespace =
      (options.namespace && String(options.namespace)) || undefined;
    if (namespace) {
      this.debug = createDebugger(namespace, className);
    } else {
      this.debug = createDebugger(className);
    }
    // опция "noEnvNs" отключает пространство имен
    // из переменной окружения DEBUGGER_NAMESPACE
    const noEnvNs = Boolean(options.noEnvNs);
    if (noEnvNs) this.debug = this.debug.withoutEnvNs();

    this.ctorDebug = this.debug.withNs('constructor').withHash();
    const noInstMsg = Boolean(options.noInstMsg);
    if (!noInstMsg) this.ctorDebug(Debuggable.INSTANTIATION_MESSAGE);
  }
}
