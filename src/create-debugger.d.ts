/**
 * Представляет функцию отладчика, которая также может быть расширена
 * пространствами имен, хэшами или отступами.
 */
export interface Debugger {
  /**
   * Вывод отладочного сообщения.
   *
   * @param messageOrData Строка сообщения (с опциональными
   *   спецификаторами формата).
   * @param args Дополнительные аргументы для интерполяции.
   */
  (message: unknown, ...args: any[]): void;

  /**
   * Создание нового экземпляра отладчика с добавленным сегментом
   * пространства имен.
   *
   * @param namespace Сегмент пространства имен для добавления.
   * @param args Дополнительные сегменты пространства имен для
   *   добавления.
   * @returns Новый экземпляр Debugger.
   * @throws {Error} Если пространство имен не является непустой
   *   строкой.
   */
  withNs(namespace: string, ...args: string[]): Debugger;

  /**
   * Создание нового экземпляра отладчика со статическим случайным хэшем,
   * добавляемым к префиксу.
   *
   * @param hashLength Желаемая длина шестнадцатеричного хэша
   *   (по умолчанию: 4).
   * @returns Новый экземпляр Debugger.
   * @throws {Error} Если длина хэша не является положительным
   *   числом.
   */
  withHash(hashLength?: number): Debugger;

  /**
   * Создание нового экземпляра отладчика с отступом для его сообщений.
   *
   * @param offsetSize Количество шагов отступа (положительное
   *   целое число).
   * @returns Новый экземпляр Debugger.
   * @throws {Error} Если размер отступа не является положительным
   *   числом.
   */
  withOffset(offsetSize: number): Debugger;

  /**
   * Создание нового экземпляра отладчика без пространства имен
   * из переменной окружения DEBUGGER_NAMESPACE.
   *
   * @returns Новый экземпляр Debugger.
   */
  withoutEnvNs(): Debugger;

  /**
   * Вывод дампа первого аргумента. Если передано два аргумента,
   * то первый будет являться описанием для второго.
   * 
   * @param dataOrDescription Данные отладки или описание для второго аргумента.
   * @param args Данные отладки (при наличии описания).
   */
  inspect(dataOrDescription: unknown, ...args: any[]): void;
}

/**
 * Create debugger.
 *
 * @param namespace Сегмент пространства имен.
 * @param namespaceSegments Дополнительные сегменты пространства имен для
 *   добавления.
 * @returns Новый экземпляр Debugger.
 */
export declare function createDebugger(
  namespace?: string,
  ...namespaceSegments: string[],
): Debugger;
