import {Service} from '@e22m4u/js-service';
import {toCamelCase} from '../utils/index.js';
import {createDebugger} from '@e22m4u/js-debug';

/**
 * Debuggable Service.
 */
export class DebuggableService extends Service {
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
   */
  constructor(container) {
    super(container);
    const serviceName = toCamelCase(this.constructor.name);
    this.debug = createDebugger(serviceName);
    const debug = this.debug.withNs('constructor').withHash();
    debug(DebuggableService.INSTANTIATION_MESSAGE);
  }
}
