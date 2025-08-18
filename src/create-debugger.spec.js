import {expect} from 'chai';
import {createSpy} from '@e22m4u/js-spy';
import {createDebugger} from './create-debugger.js';
import {DEFAULT_OFFSET_STEP_SPACES} from './create-debugger.js';

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
    consoleLogSpy = createSpy(console, 'log');
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
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
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
      expect(consoleLogSpy.callCount).to.equal(3);
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
  });

  describe('namespaces', function () {
    it('should use namespace provided in createDebugger', function () {
      process.env.DEBUG = 'app';
      const debug = createDebugger('app');
      debug('message');
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app message',
      );
    });

    it('should use multiple namespace segments provided in createDebugger', function () {
      process.env.DEBUG = 'app:service:module';
      const debug = createDebugger('app', 'service', 'module');
      debug('multi segment message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app:service:module multi segment message',
      );
    });

    it('should handle subsequent segments even if the first arg is the only namespace part', function () {
      process.env.DEBUG = 'service:module';
      const debug = createDebugger('service', 'module');
      debug('segments only message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'service:module segments only message',
      );
    });

    // --- 2. Влияние DEBUGGER_NAMESPACE при создании ---
    it('should use namespace from DEBUGGER_NAMESPACE env variable', function () {
      process.env.DEBUGGER_NAMESPACE = 'base';
      process.env.DEBUG = 'base';
      const debug = createDebugger();
      debug('message');
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'base message',
      );
    });

    it('should combine DEBUGGER_NAMESPACE and createDebugger namespace', function () {
      process.env.DEBUGGER_NAMESPACE = 'base';
      process.env.DEBUG = 'base:app';
      const debug = createDebugger('app');
      debug('message');
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'base:app message',
      );
    });

    it('should combine DEBUGGER_NAMESPACE and multiple createDebugger segments', function () {
      process.env.DEBUGGER_NAMESPACE = 'base';
      process.env.DEBUG = 'base:app:svc';
      const debug = createDebugger('app', 'svc');
      debug('env plus multi segment message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'base:app:svc env plus multi segment message',
      );
    });

    // --- 3. Модификация (withNs) ---
    it('should extend namespace with withNs()', function () {
      process.env.DEBUG = 'app:service';
      const debugApp = createDebugger('app');
      const debugService = debugApp.withNs('service');
      debugService('message');
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app:service message',
      );
    });

    it('should extend namespace with multiple args in withNs()', function () {
      process.env.DEBUG = 'app:service:module';
      const debugApp = createDebugger('app');
      const debugService = debugApp.withNs('service', 'module');
      debugService('message');
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app:service:module message',
      );
    });

    it('should allow chaining withNs()', function () {
      process.env.DEBUG = 'app:service:module';
      const debug = createDebugger('app').withNs('service').withNs('module');
      debug('message');
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app:service:module message',
      );
    });

    it('should extend namespace with withNs() after creating with multiple segments', function () {
      process.env.DEBUG = 'app:svc:mod';
      const debugBase = createDebugger('app', 'svc');
      const debugMod = debugBase.withNs('mod');
      debugMod('multi create then withNs');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app:svc:mod multi create then withNs',
      );
    });

    // --- 4. Взаимодействие DEBUGGER_NAMESPACE с модификаторами (Тесты на фикс дублирования) ---
    it('should NOT duplicate DEBUGGER_NAMESPACE when using withNs', function () {
      process.env.DEBUGGER_NAMESPACE = 'envNs';
      process.env.DEBUG = 'envNs:service';
      const debugBase = createDebugger();
      const debugService = debugBase.withNs('service');
      debugService('message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'envNs:service message',
      );
    });

    it('should correctly combine DEBUGGER_NAMESPACE, initial segments, and withNs without duplicates', function () {
      process.env.DEBUGGER_NAMESPACE = 'envNs';
      process.env.DEBUG = 'envNs:init1:init2:added';
      const debugBase = createDebugger('init1', 'init2');
      const debugAdded = debugBase.withNs('added');
      debugAdded('combined message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'envNs:init1:init2:added combined message',
      );
    });

    it('should work correctly with withNs when DEBUGGER_NAMESPACE is NOT set', function () {
      expect(process.env.DEBUGGER_NAMESPACE).to.be.undefined;
      process.env.DEBUG = 'app:service';
      const debugBase = createDebugger('app');
      const debugService = debugBase.withNs('service');
      debugService('message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app:service message',
      );
    });

    it('should add namespace prefix for each line if the given message is multiline', function () {
      process.env.DEBUG = 'app:service';
      const debug = createDebugger('app', 'service');
      debug('firstLine\nsecondLine');
      expect(consoleLogSpy.callCount).to.equal(2);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.be.eq(
        'app:service firstLine',
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.be.eq(
        'app:service secondLine',
      );
    });

    it('should throw error if createDebugger is called with invalid subsequent segment type', function () {
      expect(() => createDebugger('app', 'valid', 123)).to.throw(
        /Namespace segment must be a non-empty String/,
      );
      expect(() => createDebugger('app', 'valid', null)).to.throw(
        /Namespace segment must be a non-empty String/,
      );
      expect(() => createDebugger('app', 'valid', '')).to.throw(
        /Namespace segment must be a non-empty String/,
      );
      expect(() => createDebugger('app', '')).to.throw(
        /Namespace segment must be a non-empty String/,
      );
    });

    it('should throw error if withNs is called with non-string', function () {
      const debug = createDebugger('app');
      expect(() => debug.withNs(123)).to.throw(
        /Debugger namespace must be a non-empty String/,
      );
      expect(() => debug.withNs(null)).to.throw(
        /Debugger namespace must be a non-empty String/,
      );
      expect(() => debug.withNs('')).to.throw(
        /Debugger namespace must be a non-empty String/,
      );
    });
  });

  describe('environment', function () {
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
      expect(consoleLogSpy.callCount).to.equal(2);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'app:service message svc',
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.equal(
        'app:db message db',
      );
    });

    it('should enable all debuggers if DEBUG=*', function () {
      process.env.DEBUG = '*';
      const debug1 = createDebugger('app:service');
      const debug2 = createDebugger('other');
      debug1('msg 1');
      debug2('msg 2');
      expect(consoleLogSpy.callCount).to.equal(2);
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
      debugSvcOther('4');
      debugOther('5');
      expect(consoleLogSpy.callCount).to.equal(3);
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
      process.env.DEBUG = 'app:* svc:auth';
      const debugAppSvc = createDebugger('app:service');
      const debugSvcAuth = createDebugger('svc:auth');
      const debugOther = createDebugger('other');
      debugAppSvc('1');
      debugSvcAuth('3');
      debugOther('5');
      expect(consoleLogSpy.callCount).to.equal(2);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.contain(
        'app:service 1',
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.contain(
        'svc:auth 3',
      );
    });

    it('should use localStorage pattern if DEBUG env is not set', function () {
      global.localStorage.setItem('debug', 'local:*');
      const debugLocal = createDebugger('local:test');
      const debugOther = createDebugger('other:test');
      debugLocal('message local');
      debugOther('message other');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'local:test message local',
      );
    });

    it('should prioritize DEBUG env over localStorage', function () {
      process.env.DEBUG = 'env:*';
      global.localStorage.setItem('debug', 'local:*');
      const debugEnv = createDebugger('env:test');
      const debugLocal = createDebugger('local:test');
      debugEnv('message env');
      debugLocal('message local');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'env:test message env',
      );
    });

    it('should exclude namespace of DEBUGGER_NAMESPACE in withoutEnvNs()', function () {
      process.env.DEBUG = '*';
      process.env.DEBUGGER_NAMESPACE = 'myApp';
      const debug1 = createDebugger();
      const debug2 = debug1.withoutEnvNs();
      debug1('message 1');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
        'myApp message 1',
      );
      debug2('message 2');
      expect(consoleLogSpy.callCount).to.equal(2);
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.equal('message 2');
    });
  });

  describe('hashing', function () {
    it('should add a hash prefix with withHash()', function () {
      process.env.DEBUG = 'hash';
      const debug = createDebugger('hash').withHash();
      debug('message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
        /^hash:[a-f0-9]{4} message$/,
      );
    });

    it('should use the same hash for multiple calls on the same instance', function () {
      process.env.DEBUG = 'hash';
      const debug = createDebugger('hash').withHash();
      debug('message1');
      debug('message2');
      expect(consoleLogSpy.callCount).to.equal(2);
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
      expect(consoleLogSpy.callCount).to.equal(2);
      const hash1 = stripAnsi(consoleLogSpy.getCall(0).args[0]).match(
        /hash:([a-f0-9]{4})/,
      )[1];
      const hash2 = stripAnsi(consoleLogSpy.getCall(1).args[0]).match(
        /hash:([a-f0-9]{4})/,
      )[1];
      expect(hash1).to.not.equal(hash2);
    });

    it('should allow specifying hash length in withHash()', function () {
      process.env.DEBUG = 'hash';
      const debug = createDebugger('hash').withHash(8);
      debug('message');
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
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

    it('should NOT duplicate DEBUGGER_NAMESPACE when using withHash', function () {
      process.env.DEBUGGER_NAMESPACE = 'envNs';
      process.env.DEBUG = 'envNs';
      const debugBase = createDebugger();
      const debugHashed = debugBase.withHash();
      debugHashed('message');
      expect(consoleLogSpy.callCount).to.equal(1);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
        /^envNs:[a-f0-9]{4} message$/,
      );
    });
  });

  describe('offset', function () {
    it('should add offset spaces with withOffset()', function () {
      process.env.DEBUG = 'offset';
      // предполагая, что offsetStep = '   '
      const debug1 = createDebugger('offset').withOffset(1);
      const debug2 = createDebugger('offset').withOffset(2);
      debug1('message1');
      debug2('message2');
      expect(consoleLogSpy.callCount).to.equal(2);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
        new RegExp(
          '^offset\\s{' + (DEFAULT_OFFSET_STEP_SPACES + 1) + '}message1$',
        ),
      );
      expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.match(
        new RegExp(
          '^offset\\s{' + (DEFAULT_OFFSET_STEP_SPACES * 2 + 1) + '}message2$',
        ),
      );
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

    it('should NOT duplicate DEBUGGER_NAMESPACE when using withOffset', function () {
      process.env.DEBUGGER_NAMESPACE = 'envNs';
      process.env.DEBUG = 'envNs';
      const debugBase = createDebugger();
      const debugOffset = debugBase.withOffset(1);
      debugOffset('message');
      expect(consoleLogSpy.callCount).to.equal(1);
      // предполагая, что offsetStep = '   '
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
        new RegExp(
          '^envNs\\s{' + (DEFAULT_OFFSET_STEP_SPACES + 1) + '}message$',
        ),
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
      expect(consoleLogSpy.callCount).to.equal(1);
      // предполагая, что offsetStep = '   '
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
        new RegExp(
          '^app:svc:[a-f0-9]{5}\\s{' +
            (DEFAULT_OFFSET_STEP_SPACES + 1) +
            '}combined message$',
        ),
      );
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
      expect(() => createDebugger([])).to.throw(
        /must be a String or an Object/,
      );
    });
  });

  describe('inspect method', function () {
    it('should not output if debugger is disabled', function () {
      process.env.DEBUG = 'other';
      const debug = createDebugger('app');
      debug.inspect({a: 1});
      expect(consoleLogSpy.called).to.be.false;
    });

    it('should output a colorized dump of a single argument', function () {
      process.env.DEBUG = 'app';
      const debug = createDebugger('app');
      const data = {user: {id: 1, name: 'test'}};
      debug.inspect(data);
      // createColorizedDump выводит многострочный результат,
      // поэтому проверяем несколько вызовов console.log
      expect(consoleLogSpy.callCount).to.be.above(1);
      const firstLine = stripAnsi(consoleLogSpy.getCall(0).args[0]);
      const secondLine = stripAnsi(consoleLogSpy.getCall(1).args[0]);
      expect(firstLine).to.equal('app {');
      // проверяем вторую строку с отступом,
      // который добавляет createColorizedDump
      expect(secondLine).to.match(/^app\s{3}user: \{$/);
    });

    it('should use the first argument as a description for the next ones', function () {
      process.env.DEBUG = 'app';
      const debug = createDebugger('app');
      const data = {id: 123};
      debug.inspect('User data:', data);
      expect(consoleLogSpy.callCount).to.be.above(1);
      const descriptionLine = stripAnsi(consoleLogSpy.getCall(0).args[0]);
      const dumpLine = stripAnsi(consoleLogSpy.getCall(1).args[0]);
      expect(descriptionLine).to.equal('app User data:');
      // проверка, что к дампу добавлен дополнительный отступ
      const expectedInternalOffset = ' '.repeat(DEFAULT_OFFSET_STEP_SPACES);
      expect(dumpLine).to.equal(`app ${expectedInternalOffset}{`);
    });

    describe('combine', function () {
      it('should include namespace from withNs() in inspect output', function () {
        process.env.DEBUG = 'app:svc';
        const debug = createDebugger('app').withNs('svc');
        debug.inspect('Data:', {a: 1});
        const descriptionLine = stripAnsi(consoleLogSpy.getCall(0).args[0]);
        expect(descriptionLine).to.equal('app:svc Data:');
      });

      it('should include hash from withHash() in inspect output', function () {
        process.env.DEBUG = 'app';
        const debug = createDebugger('app').withHash(6);
        debug.inspect({a: 1});
        const firstLine = stripAnsi(consoleLogSpy.getCall(0).args[0]);
        expect(firstLine).to.match(/^app:[a-f0-9]{6} \{$/);
      });

      it('should apply offset from withOffset() to inspect output', function () {
        process.env.DEBUG = 'app';
        const debug = createDebugger('app').withOffset(2);
        debug.inspect('My Data:', {a: 1});
        const offsetSpaces = ' '.repeat(DEFAULT_OFFSET_STEP_SPACES * 2);
        const internalOffset = ' '.repeat(DEFAULT_OFFSET_STEP_SPACES);
        const descriptionLine = stripAnsi(consoleLogSpy.getCall(0).args[0]);
        const dumpLine = stripAnsi(consoleLogSpy.getCall(1).args[0]);
        expect(descriptionLine).to.equal(`app${offsetSpaces} My Data:`);
        // проверка применения отступа к дампу (префикс + внутренний отступ)
        expect(dumpLine).to.equal(`app${offsetSpaces} ${internalOffset}{`);
      });

      it('should respect withoutEnvNs() in inspect output', function () {
        process.env.DEBUG = '*';
        process.env.DEBUGGER_NAMESPACE = 'myApp';
        const debugWithEnv = createDebugger('api');
        const debugWithoutEnv = debugWithEnv.withoutEnvNs();
        // вызов inspect на исходном отладчике
        debugWithEnv.inspect('With env');
        expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.equal(
          "myApp:api 'With env'",
        );
        // вызов на новом отладчике
        debugWithoutEnv.inspect('Without env');
        expect(stripAnsi(consoleLogSpy.getCall(1).args[0])).to.equal(
          "api 'Without env'",
        );
      });

      it('should combine all modifiers for inspect output', function () {
        process.env.DEBUG = '*';
        process.env.DEBUGGER_NAMESPACE = 'myApp';
        const debug = createDebugger('api')
          .withNs('users')
          .withHash(4)
          .withOffset(1)
          .withoutEnvNs();
        debug.inspect('User List:', [{id: 1}, {id: 2}]);
        const offsetSpaces = ' '.repeat(DEFAULT_OFFSET_STEP_SPACES * 1);
        const internalOffset = ' '.repeat(DEFAULT_OFFSET_STEP_SPACES);
        const descriptionLine = stripAnsi(consoleLogSpy.getCall(0).args[0]);
        const dumpLine = stripAnsi(consoleLogSpy.getCall(1).args[0]);
        // проверка отсутствия DEBUGGER_NAMESPACE
        expect(descriptionLine).to.not.contain('myApp');
        // проверка всей строки с помощью регулярного выражения
        expect(descriptionLine).to.match(
          new RegExp(`^api:users:[a-f0-9]{4}${offsetSpaces} User List:$`),
        );
        expect(dumpLine).to.match(
          new RegExp(
            `^api:users:[a-f0-9]{4}${offsetSpaces} ${internalOffset}\\[$`,
          ),
        );
      });
    });
  });
});
