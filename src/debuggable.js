import {toCamelCase} from './utils/index.js';
import {createDebugger} from './create-debugger.js';

/**
 * @typedef {{
 *   namespace?: string,
 *   noGlobalNamespace?: boolean,
 *   noInstantiationMessage?: boolean,
 * }} DebuggableOptions
 */

/**
 * Debuggable.
 */
export class Debuggable {
  /**
   * Instantiation message.
   *
   * @type {string}
   */
  static INSTANTIATION_MESSAGE = 'Instantiated.';

  /**
   * Debug.
   *
   * @type {*}
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
    const name = method.name || 'anonymous';
    return this.debug.withHash().withNs(name);
  }

  /**
   * Constructor.
   *
   * @param {DebuggableOptions} [options]
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
    // опция "noGlobalNamespace" отключает глобальные пространства
    // имен, полученные из переменной окружения DEBUGGER_NAMESPACE
    // и по ключу "debuggerNamespace" локального хранилища
    const noGlobalNamespace = Boolean(options.noGlobalNamespace);
    if (noGlobalNamespace) {
      this.debug = this.debug.withoutGlobalNs();
    }
    this.ctorDebug = this.debug.withNs('constructor').withHash();
    const noInstantiationMessage = Boolean(options.noInstantiationMessage);
    if (!noInstantiationMessage) {
      this.ctorDebug(Debuggable.INSTANTIATION_MESSAGE);
    }
  }
}
