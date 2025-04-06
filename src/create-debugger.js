import {inspect} from 'util';
import {Errorf} from '@e22m4u/js-format';
import {format} from '@e22m4u/js-format';
import {isNonArrayObject} from './utils/index.js';
import {generateRandomHex} from './utils/index.js';

/**
 * Доступные цвета.
 *
 * @type {number[]}
 */
const AVAILABLE_COLORS = [
  20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68,
  69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134,
  135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
  172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204,
  205, 206, 207, 208, 209, 214, 215, 220, 221,
];

/**
 * Опции утилиты inspect для дампа объектов.
 *
 * @type {object}
 */
const INSPECT_OPTIONS = {
  showHidden: false,
  depth: null,
  colors: true,
  compact: false,
};

/**
 * Подбор цвета для строки.
 *
 * @param {string} input
 * @returns {number}
 */
function pickColorCode(input) {
  if (typeof input !== 'string')
    throw new Errorf(
      'The parameter "input" of the function pickColorCode ' +
        'must be a String, but %v given.',
      input,
    );
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return AVAILABLE_COLORS[Math.abs(hash) % AVAILABLE_COLORS.length];
}

/**
 * Оборачивает строку в цветовой код. Цвет определяется
 * по содержимому строки.
 *
 * @param {string} input
 * @param {number} color
 * @returns {string}
 */
function wrapStringByColorCode(input, color) {
  if (typeof input !== 'string')
    throw new Errorf(
      'The parameter "input" of the function wrapStringByColorCode ' +
        'must be a String, but %v given.',
      input,
    );
  if (typeof color !== 'number')
    throw new Errorf(
      'The parameter "color" of the function wrapStringByColorCode ' +
        'must be a Number, but %v given.',
      color,
    );
  const colorCode = '\u001B[3' + (Number(color) < 8 ? color : '8;5;' + color);
  return `${colorCode};1m${input}\u001B[0m`;
}

/**
 * Проверка соответствия строки указанному шаблону.
 *
 * Примеры:
 * ```ts
 * console.log(matchPattern('app*', 'app:service')); // true
 * console.log(matchPattern('app:*', 'app:service')); // true
 * console.log(matchPattern('other*', 'app:service')); // false
 * console.log(matchPattern('app:service', 'app:service')); // true
 * console.log(matchPattern('app:other', 'app:service')); // false
 * ```
 *
 * @param {string} pattern
 * @param {string} input
 * @returns {boolean}
 */
function matchPattern(pattern, input) {
  if (typeof pattern !== 'string')
    throw new Errorf(
      'The parameter "pattern" of the function matchPattern ' +
        'must be a String, but %v given.',
      pattern,
    );
  if (typeof input !== 'string')
    throw new Errorf(
      'The parameter "input" of the function matchPattern ' +
        'must be a String, but %v given.',
      input,
    );
  const regexpStr = pattern.replace(/\*/g, '.*?');
  const regexp = new RegExp('^' + regexpStr + '$');
  return regexp.test(input);
}

/**
 * Create debugger.
 *
 * @param {string} namespaceOrOptions
 * @param {string[]} namespaceSegments
 * @returns {Function}
 */
export function createDebugger(
  namespaceOrOptions = undefined,
  ...namespaceSegments
) {
  // если первый аргумент не является строкой
  // и объектом, то выбрасывается ошибка
  if (
    namespaceOrOptions &&
    typeof namespaceOrOptions !== 'string' &&
    !isNonArrayObject(namespaceOrOptions)
  ) {
    throw new Errorf(
      'The parameter "namespace" of the function createDebugger ' +
        'must be a String or an Object, but %v given.',
      namespaceOrOptions,
    );
  }
  // формирование состояния отладчика
  // для хранения текущих настроек
  const state = isNonArrayObject(namespaceOrOptions) ? namespaceOrOptions : {};
  state.nsSegments = Array.isArray(state.nsSegments) ? state.nsSegments : [];
  state.pattern = typeof state.pattern === 'string' ? state.pattern : '';
  state.hash = typeof state.hash === 'string' ? state.hash : '';
  state.offsetSize =
    typeof state.offsetSize === 'number' ? state.offsetSize : 0;
  state.offsetStep =
    typeof state.offsetStep === 'string' ? state.offsetStep : '   ';
  state.delimiter =
    state.delimiter && typeof state.delimiter === 'string'
      ? state.delimiter
      : ':';
  // если переменная окружения содержит пространство
  // имен, то значение переменной добавляется
  // в общий список
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env['DEBUGGER_NAMESPACE']
  ) {
    state.nsSegments.push(process.env.DEBUGGER_NAMESPACE);
  }
  // если первый аргумент содержит значение,
  // то оно используется как пространство имен
  if (typeof namespaceOrOptions === 'string')
    state.nsSegments.push(namespaceOrOptions);
  // проверка типа дополнительных сегментов пространства
  // имен, и добавление их в общий набор сегментов
  namespaceSegments.forEach(segment => {
    if (!segment || typeof segment !== 'string')
      throw new Errorf(
        'Namespace segment must be a non-empty String, but %v given.',
        segment,
      );
    state.nsSegments.push(segment);
  });
  // если переменная окружения DEBUG содержит
  // значение, то оно используется как шаблон
  if (typeof process !== 'undefined' && process.env && process.env['DEBUG']) {
    state.pattern = process.env['DEBUG'];
  }
  // если локальное хранилище браузера содержит
  // значение по ключу "debug", то оно используется
  // как шаблон вывода
  else if (
    typeof localStorage !== 'undefined' &&
    typeof localStorage.getItem('debug') === 'string'
  ) {
    state.pattern = localStorage.getItem('debug');
  }
  // формирование функции для проверки
  // активности текущего отладчика
  const isDebuggerEnabled = () => {
    const nsStr = state.nsSegments.join(state.delimiter);
    const patterns = state.pattern.split(/[\s,]+/).filter(p => p.length > 0);
    if (patterns.length === 0 && state.pattern !== '*') return false;
    for (const singlePattern of patterns) {
      if (matchPattern(singlePattern, nsStr)) return true;
    }
    return false;
  };
  // формирование префикса
  // для сообщений отладки
  const getPrefix = () => {
    let tokens = [];
    [...state.nsSegments, state.hash].filter(Boolean).forEach(token => {
      const extractedTokens = token.split(state.delimiter).filter(Boolean);
      tokens = [...tokens, ...extractedTokens];
    });
    let res = tokens.reduce((acc, token, index) => {
      const isLast = tokens.length - 1 === index;
      const tokenColor = pickColorCode(token);
      acc += wrapStringByColorCode(token, tokenColor);
      if (!isLast) acc += state.delimiter;
      return acc;
    }, '');
    if (state.offsetSize > 0) res += state.offsetStep.repeat(state.offsetSize);
    return res;
  };
  // формирование функции вывода
  // сообщений отладки
  function debugFn(messageOrData, ...args) {
    if (!isDebuggerEnabled()) return;
    const prefix = getPrefix();
    if (typeof messageOrData === 'string') {
      const message = format(messageOrData, ...args);
      prefix ? console.log(`${prefix} ${message}`) : console.log(message);
      return;
    }
    const multiString = inspect(messageOrData, INSPECT_OPTIONS);
    const rows = multiString.split('\n');
    [...args, ...rows].forEach(message => {
      prefix ? console.log(`${prefix} ${message}`) : console.log(message);
    });
  }
  // создание новой функции логирования
  // с дополнительным пространством имен
  debugFn.withNs = function (namespace, ...args) {
    const stCopy = JSON.parse(JSON.stringify(state));
    [namespace, ...args].forEach(ns => {
      if (!ns || typeof ns !== 'string')
        throw new Errorf(
          'Debugger namespace must be a non-empty String, but %v given.',
          ns,
        );
      stCopy.nsSegments.push(ns);
    });
    return createDebugger(stCopy);
  };
  // создание новой функции логирования
  // со статическим хэшем
  debugFn.withHash = function (hashLength = 4) {
    const stCopy = JSON.parse(JSON.stringify(state));
    if (!hashLength || typeof hashLength !== 'number' || hashLength < 1) {
      throw new Errorf(
        'Debugger hash must be a positive Number, but %v given.',
        hashLength,
      );
    }
    stCopy.hash = generateRandomHex(hashLength);
    return createDebugger(stCopy);
  };
  // создание новой функции логирования
  // со смещением сообщений отладки
  debugFn.withOffset = function (offsetSize) {
    const stCopy = JSON.parse(JSON.stringify(state));
    if (!offsetSize || typeof offsetSize !== 'number' || offsetSize < 1) {
      throw new Errorf(
        'Debugger offset must be a positive Number, but %v given.',
        offsetSize,
      );
    }
    stCopy.offsetSize = offsetSize;
    return createDebugger(stCopy);
  };
  return debugFn;
}
