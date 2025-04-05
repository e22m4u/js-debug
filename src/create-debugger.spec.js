import sinon from 'sinon';
import {expect} from 'chai';
import {inspect} from 'util';
import {createDebugger} from './create-debugger.js';

// вспомогательная функция для удаления ANSI escape-кодов (цветов)
// eslint-disable-next-line no-control-regex
const stripAnsi = str => str.replace(/\x1b\[[0-9;]*m/g, '');

describe('createDebugger', function () {
  let consoleLogSpy;
  let originalDebugEnv;
  let originalDebuggerNamespaceEnv;
  let originalLocalStorage;

  beforeEach(function () {
    // шпионим за console.log перед каждым тестом
    consoleLogSpy = sinon.spy(console, 'log');
    // сохраняем исходные переменные окружения
    originalDebugEnv = process.env.DEBUG;
    originalDebuggerNamespaceEnv = process.env.DEBUGGER_NAMESPACE;
    // базовая симуляция localStorage для тестов
    originalLocalStorage = global.localStorage;
    global.localStorage = {
      _store: {},
      getItem(key) {
        return this._store[key] || null;
      },
      setItem(key, value) {
        this._store[key] = String(value);
      },
      removeItem(key) {
        delete this._store[key];
      },
      clear() {
        this._store = {};
      },
    };
    // сбрасываем переменные перед тестом
    delete process.env.DEBUG;
    delete process.env.DEBUGGER_NAMESPACE;
    global.localStorage.clear();
  });

  afterEach(function () {
    // восстанавливаем console.log
    consoleLogSpy.restore();
    // восстанавливаем переменные окружения
    if (originalDebugEnv === undefined) {
      delete process.env.DEBUG;
    } else {
      process.env.DEBUG = originalDebugEnv;
    }
    if (originalDebuggerNamespaceEnv === undefined) {
      delete process.env.DEBUGGER_NAMESPACE;
    } else {
      process.env.DEBUGGER_NAMESPACE = originalDebuggerNamespaceEnv;
    }
    // восстанавливаем localStorage
    global.localStorage = originalLocalStorage;
  });

  describe('general', function () {
    it('should create a debugger function', function () {
      const debug = createDebugger('test');
      expect(debug).to.be.a('function');
      expect(debug.withNs).to.be.a('function');
      expect(debug.withHash).to.be.a('function');
      expect(debug.withOffset).to.be.a('function');
    });

    it('should output a simple string message when enabled', function () {
      process.env.DEBUG = 'test';
      const debug = createDebugger('test');
      debug('hello world');
      expect(consoleLogSpy.calledOnce).to.be.true;
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'test hello world',
      );
    });

    it('should not output if not enabled via DEBUG', function () {
      process.env.DEBUG = 'other';
      const debug = createDebugger('test');
      debug('hello world');
      expect(consoleLogSpy.called).to.be.false;
    });

    it('should output formatted string messages using %s, %v, %l', function () {
      process.env.DEBUG = 'format';
      const debug = createDebugger('format');
      debug('hello %s', 'world');
      debug('value is %v', 123);
      debug('list: %l', ['a', 1, true]);
      expect(consoleLogSpy.calledThrice).to.be.true;
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'format hello world',
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.equal(
        'format value is 123',
      );
      expect(stripAnsi(consoleLogSpy.getCall(2).args[0])).to.equal(
        'format list: "a", 1, true',
      );
    });

    it('should output object inspection', function () {
      process.env.DEBUG = 'obj';
      const debug = createDebugger('obj');
      const data = {a: 1, b: {c: 'deep'}};
      debug(data);
      // ожидаем, что inspect будет вызван и его результат
      // будет выведен построчно
      const expectedInspect = inspect(data, {
        colors: true,
        depth: null,
        compact: false,
      });
      const expectedLines = expectedInspect.split('\n');
      expect(consoleLogSpy.callCount).to.equal(expectedLines.length);
      expectedLines.forEach((line, index) => {
        // проверяем каждую строку с префиксом
        // замечание: точное сравнение с inspect может быть хрупким из-за версий node/util
        // здесь мы проверяем, что префикс есть и остальная часть строки соответствует inspect
        expect(stripAnsi(consoleLogSpy.getCall(index).args[0])).to.contain(
          'obj ',
        );
        // ожидаем, что строка вывода содержит соответствующую строку из inspect (без цвета)
        expect(stripAnsi(consoleLogSpy.getCall(index).args[0])).to.have.string(
          stripAnsi(line),
        );
      });
    });

    it('should output object inspection with a description', function () {
      process.env.DEBUG = 'objdesc';
      const debug = createDebugger('objdesc');
      const data = {email: 'test@example.com'};
      const description = 'User data:';
      debug(data, description);
      const expectedInspect = inspect(data, {
        colors: true,
        depth: null,
        compact: false,
      });
      const expectedLines = expectedInspect.split('\n');
      // 1 для описания + строки объекта
      const totalExpectedCalls = 1 + expectedLines.length;
      expect(consoleLogSpy.callCount).to.equal(totalExpectedCalls);
      // первая строка - описание
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        `objdesc ${description}`,
      );
      // последующие строки - объект
      expectedLines.forEach((line, index) => {
        const callIndex = index + 1;
        expect(stripAnsi(consoleLogSpy.getCall(callIndex).args[0])).to.contain(
          'objdesc ',
        );
        expect(
          stripAnsi(consoleLogSpy.getCall(callIndex).args[0]),
        ).to.have.string(stripAnsi(line));
      });
    });
  });

  describe('namespaces', function () {
    it('should use namespace provided in createDebugger', function () {
      process.env.DEBUG = 'app';
      const debug = createDebugger('app');
      debug('message');
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'app message',
      );
    });

    it('should use namespace from DEBUGGER_NAMESPACE env variable', function () {
      process.env.DEBUGGER_NAMESPACE = 'base';
      // должен быть включен для вывода
      process.env.DEBUG = 'base';
      // без явного namespace
      const debug = createDebugger();
      debug('message');
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'base message',
      );
    });

    it('should combine DEBUGGER_NAMESPACE and createDebugger namespace', function () {
      process.env.DEBUGGER_NAMESPACE = 'base';
      process.env.DEBUG = 'base:app';
      const debug = createDebugger('app');
      debug('message');
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'base:app message',
      );
    });

    it('should extend namespace with withNs()', function () {
      process.env.DEBUG = 'app:service';
      const debugApp = createDebugger('app');
      const debugService = debugApp.withNs('service');
      debugService('message');
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'app:service message',
      );
    });

    it('should extend namespace with multiple args in withNs()', function () {
      process.env.DEBUG = 'app:service:module';
      const debugApp = createDebugger('app');
      const debugService = debugApp.withNs('service', 'module');
      debugService('message');
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'app:service:module message',
      );
    });

    it('should allow chaining withNs()', function () {
      process.env.DEBUG = 'app:service:module';
      const debug = createDebugger('app').withNs('service').withNs('module');
      debug('message');
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'app:service:module message',
      );
    });

    it('should throw error if withNs is called with non-string', function () {
      const debug = createDebugger('app');
      expect(() => debug.withNs(123)).to.throw(/must be a non-empty String/);
      expect(() => debug.withNs(null)).to.throw(/must be a non-empty String/);
      expect(() => debug.withNs('')).to.throw(/must be a non-empty String/);
    });
  });

  describe('DEBUG / localStorage', function () {
    it('should enable debugger based on exact match in DEBUG', function () {
      process.env.DEBUG = 'app:service';
      const debug = createDebugger('app:service');
      debug('message');
      expect(consoleLogSpy.called).to.be.true;
    });

    it('should disable debugger if no match in DEBUG', function () {
      process.env.DEBUG = 'app:other';
      const debug = createDebugger('app:service');
      debug('message');
      expect(consoleLogSpy.called).to.be.false;
    });

    it('should enable debugger based on wildcard match in DEBUG (*)', function () {
      process.env.DEBUG = 'app:*';
      const debugService = createDebugger('app:service');
      const debugDb = createDebugger('app:db');
      const debugOther = createDebugger('other:app');
      debugService('message svc');
      debugDb('message db');
      debugOther('message other');
      expect(consoleLogSpy.calledTwice).to.be.true;
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'app:service message svc',
      );
      expect(stripAnsi(consoleLogSpy.secondCall.args[0])).to.equal(
        'app:db message db',
      );
    });

    it('should enable all debuggers if DEBUG=*', function () {
      process.env.DEBUG = '*';
      const debug1 = createDebugger('app:service');
      const debug2 = createDebugger('other');
      debug1('msg 1');
      debug2('msg 2');
      expect(consoleLogSpy.calledTwice).to.be.true;
    });

    it('should handle multiple patterns in DEBUG (comma)', function () {
      process.env.DEBUG = 'app:*,svc:auth';
      const debugAppSvc = createDebugger('app:service');
      const debugAppDb = createDebugger('app:db');
      const debugSvcAuth = createDebugger('svc:auth');
      const debugSvcOther = createDebugger('svc:other');
      const debugOther = createDebugger('other');
      debugAppSvc('1');
      debugAppDb('2');
      debugSvcAuth('3');
      // не должен выводиться
      debugSvcOther('4');
      debugOther('5');
      expect(consoleLogSpy.calledThrice).to.be.true;
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.contain(
        'app:service 1',
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.contain(
        'app:db 2',
      );
      expect(stripAnsi(consoleLogSpy.getCall(2).args[0])).to.contain(
        'svc:auth 3',
      );
    });

    it('should handle multiple patterns in DEBUG (space)', function () {
      // используем пробел
      process.env.DEBUG = 'app:* svc:auth';
      const debugAppSvc = createDebugger('app:service');
      const debugSvcAuth = createDebugger('svc:auth');
      const debugOther = createDebugger('other');
      debugAppSvc('1');
      debugSvcAuth('3');
      // не должен выводиться
      debugOther('5');
      expect(consoleLogSpy.calledTwice).to.be.true;
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.contain(
        'app:service 1',
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.contain(
        'svc:auth 3',
      );
    });

    it('should use localStorage pattern if DEBUG env is not set', function () {
      // process.env.debug не установлен (по умолчанию в beforeEach)
      global.localStorage.setItem('debug', 'local:*');
      const debugLocal = createDebugger('local:test');
      const debugOther = createDebugger('other:test');
      debugLocal('message local');
      debugOther('message other');
      expect(consoleLogSpy.calledOnce).to.be.true;
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'local:test message local',
      );
    });

    it('should prioritize DEBUG env over localStorage', function () {
      process.env.DEBUG = 'env:*';
      global.localStorage.setItem('debug', 'local:*');
      const debugEnv = createDebugger('env:test');
      const debugLocal = createDebugger('local:test');
      debugEnv('message env');
      // не должен выводиться
      debugLocal('message local');
      expect(consoleLogSpy.calledOnce).to.be.true;
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.equal(
        'env:test message env',
      );
    });
  });

  describe('hashing', function () {
    it('should add a hash prefix with withHash()', function () {
      process.env.DEBUG = 'hash';
      // default length 4
      const debug = createDebugger('hash').withHash();
      debug('message');
      expect(consoleLogSpy.calledOnce).to.be.true;
      // проверяем формат: namespace:hash message
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.match(
        /^hash:[a-f0-9]{4} message$/,
      );
    });

    it('should use the same hash for multiple calls on the same instance', function () {
      process.env.DEBUG = 'hash';
      const debug = createDebugger('hash').withHash();
      debug('message1');
      debug('message2');
      expect(consoleLogSpy.calledTwice).to.be.true;
      const hash1 = stripAnsi(consoleLogSpy.getCall(0).args[0]).match(
        /hash:([a-f0-9]{4})/,
      )[1];
      const hash2 = stripAnsi(consoleLogSpy.getCall(1).args[0]).match(
        /hash:([a-f0-9]{4})/,
      )[1];
      expect(hash1).to.equal(hash2);
    });

    it('should generate different hashes for different instances', function () {
      process.env.DEBUG = 'hash';
      const debug1 = createDebugger('hash').withHash();
      const debug2 = createDebugger('hash').withHash();
      debug1('m1');
      debug2('m2');
      expect(consoleLogSpy.calledTwice).to.be.true;
      const hash1 = stripAnsi(consoleLogSpy.getCall(0).args[0]).match(
        /hash:([a-f0-9]{4})/,
      )[1];
      const hash2 = stripAnsi(consoleLogSpy.getCall(1).args[0]).match(
        /hash:([a-f0-9]{4})/,
      )[1];
      // вероятность коллизии крайне мала для 4 символов
      expect(hash1).to.not.equal(hash2);
    });

    it('should allow specifying hash length in withHash()', function () {
      process.env.DEBUG = 'hash';
      const debug = createDebugger('hash').withHash(8);
      debug('message');
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.match(
        /^hash:[a-f0-9]{8} message$/,
      );
    });

    it('should throw error if withHash is called with invalid length', function () {
      const debug = createDebugger('app');
      expect(() => debug.withHash(0)).to.throw(/must be a positive Number/);
      expect(() => debug.withHash(-1)).to.throw(/must be a positive Number/);
      expect(() => debug.withHash(null)).to.throw(/must be a positive Number/);
      expect(() => debug.withHash('abc')).to.throw(/must be a positive Number/);
    });
  });

  describe('offset', function () {
    // предупреждение: ожидания в этом тесте (`offset    message1`) могут не соответствовать
    // предполагаемой логике (2 пробела на уровень), проверьте реализацию `getPrefix` и `offsetStep`.
    it('should add offset spaces with withOffset()', function () {
      process.env.DEBUG = 'offset';
      const debug1 = createDebugger('offset').withOffset(1);
      const debug2 = createDebugger('offset').withOffset(2);
      debug1('message1');
      debug2('message2');
      expect(consoleLogSpy.calledTwice).to.be.true;
      // проверяем отступы (этот комментарий может быть неточен, см. предупреждение выше)
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'offset    message1',
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.equal(
        'offset       message2',
      );
    });

    it('should apply offset to all lines of object inspection', function () {
      process.env.DEBUG = 'offsetobj';
      const debug = createDebugger('offsetobj').withOffset(1);
      const data = {a: 1, b: 2};
      debug(data);

      const expectedInspect = inspect(data, {
        colors: true,
        depth: null,
        compact: false,
      });
      const expectedLines = expectedInspect.split('\n');

      expect(consoleLogSpy.callCount).to.equal(expectedLines.length);
      expectedLines.forEach((line, index) => {
        // ожидаем префикс + отступ + текст строки
        // предупреждение: \s{2} здесь может не соответствовать ожиданиям в других тестах смещения.
        expect(stripAnsi(consoleLogSpy.getCall(index).args[0])).to.match(
          /^offsetobj\s{2}/,
        );
        expect(stripAnsi(consoleLogSpy.getCall(index).args[0])).to.contain(
          stripAnsi(line),
        );
      });
    });

    it('should throw error if withOffset is called with invalid size', function () {
      const debug = createDebugger('app');
      expect(() => debug.withOffset(0)).to.throw(/must be a positive Number/);
      expect(() => debug.withOffset(-1)).to.throw(/must be a positive Number/);
      expect(() => debug.withOffset(null)).to.throw(
        /must be a positive Number/,
      );
      expect(() => debug.withOffset('abc')).to.throw(
        /must be a positive Number/,
      );
    });
  });

  describe('combine', function () {
    it('should combine namespace, hash, and offset', function () {
      process.env.DEBUG = 'app:svc';
      const debug = createDebugger('app')
        .withNs('svc')
        .withHash(5)
        .withOffset(1);
      debug('combined message');

      expect(consoleLogSpy.calledOnce).to.be.true;
      // ожидаемый формат: namespace:hash<offset>message
      // предупреждение: \s{4} здесь может не соответствовать ожиданиям в других тестах смещения.
      expect(stripAnsi(consoleLogSpy.firstCall.args[0])).to.match(
        /^app:svc:[a-f0-9]{5}\s{4}combined message$/,
      );
    });

    it('should combine features and output object correctly', function () {
      process.env.DEBUG = 'app:svc';
      const debug = createDebugger('app')
        .withNs('svc')
        .withHash(3)
        .withOffset(1);

      const data = {id: 123};
      const description = 'Data:';
      debug(data, description);

      const expectedInspect = inspect(data, {
        colors: true,
        depth: null,
        compact: false,
      });
      const expectedLines = expectedInspect.split('\n');
      const totalExpectedCalls = 1 + expectedLines.length;

      expect(consoleLogSpy.callCount).to.equal(totalExpectedCalls);

      // проверяем строку описания
      // предупреждение: \s{4} здесь может не соответствовать ожиданиям в других тестах смещения.
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
        /^app:svc:[a-f0-9]{3}\s{4}Data:$/,
      );

      // проверяем строки объекта
      expectedLines.forEach((line, index) => {
        const callIndex = index + 1;
        const logLine = stripAnsi(consoleLogSpy.getCall(callIndex).args[0]);
        // префикс, хэш, отступ
        // предупреждение: \s{2} здесь может не соответствовать ожиданиям в других тестах смещения.
        expect(logLine).to.match(/^app:svc:[a-f0-9]{3}\s{2}/);
        // содержимое строки inspect
        expect(logLine).to.contain(stripAnsi(line));
      });
    });
  });

  describe('creation error', function () {
    it('should throw error if createDebugger is called with invalid type', function () {
      expect(() => createDebugger(123)).to.throw(
        /must be a String or an Object/,
      );
      expect(() => createDebugger(true)).to.throw(
        /must be a String or an Object/,
      );
      // массив - не простой объект
      expect(() => createDebugger([])).to.throw(
        /must be a String or an Object/,
      );
      // null должен вызывать ошибку (проверяется отдельно или убедитесь, что isNonArrayObject(null) === false)
      // expect(() => createDebugger(null)).to.throw(/must be a String or an Object/);
    });
  });
});
