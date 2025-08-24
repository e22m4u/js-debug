import {Callable} from '../types.js';
import {Service} from '@e22m4u/js-service';
import {Debugger} from '../create-debugger.js';
import {ServiceContainer} from '@e22m4u/js-service';

/**
 * Debuggable Service.
 */
export class DebuggableService extends Service {
  /**
   * Debug.
   */
  debug: Debugger;

  /**
   * Возвращает функцию-отладчик с сегментом пространства имен
   * указанного в параметре метода.
   *
   * @param method
   * @protected
   */
  protected getDebuggerFor(method: Callable): Debugger;

  /**
   * Constructor.
   *
   * @param container
   */
  constructor(container?: ServiceContainer);
}
