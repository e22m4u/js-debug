import {Callable} from './types.js';
import {Debugger} from './create-debugger.js';

/**
 * Debuggable options.
 */
export type DebuggableOptions = {
  namespace?: string,
  noEnvironmentNamespace?: boolean,
  noInstantiationMessage?: boolean,
}

/**
 * Debuggable.
 */
export class Debuggable {
  /**
   * Instantiation message.
   */
  static INSTANTIATION_MESSAGE: string;

  /**
   * Debug.
   */
  debug: Debugger;

  /**
   * Debug.
   */
  ctorDebug: Debugger;

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
   * @param options
   */
  constructor(options?: DebuggableOptions);
}
