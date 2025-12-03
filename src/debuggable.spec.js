import {expect} from 'chai';
import {createSpy} from '@e22m4u/js-spy';
import {Debuggable} from './debuggable.js';
import {stripAnsi} from './utils/index.js';
import {escapeRegexp} from './utils/index.js';

describe('Debuggable', function () {
  let consoleLogSpy;
  let originalDebugEnv;
  let originalDebuggerNamespaceEnv;

  beforeEach(function () {
    // шпионим за console.log перед каждым тестом
    consoleLogSpy = createSpy(console, 'log');
    // сохраняем исходные переменные окружения
    originalDebugEnv = process.env.DEBUG;
    originalDebuggerNamespaceEnv = process.env.DEBUGGER_NAMESPACE;
    // сбрасываем переменные перед тестом
    delete process.env.DEBUG;
    delete process.env.DEBUGGER_NAMESPACE;
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
  });

  it('has the debug method', function () {
    const res = new Debuggable();
    expect(typeof res.debug).to.be.eq('function');
  });

  describe('constructor', function () {
    it('should output the specific message when instantiated', function () {
      process.env.DEBUG = '*';
      new Debuggable();
      expect(consoleLogSpy.callCount).to.equal(1);
      const msg = escapeRegexp(Debuggable.INSTANTIATION_MESSAGE);
      expect(stripAnsi(consoleLogSpy.calls[0].args[0])).to.match(
        new RegExp(`^debuggable:constructor:[a-f0-9]{4} ${msg}$`),
      );
    });

    it('should use DEBUGGER_NAMESPACE environment variable', function () {
      process.env.DEBUGGER_NAMESPACE = 'myApp';
      process.env.DEBUG = '*';
      new Debuggable();
      expect(consoleLogSpy.callCount).to.equal(1);
      const msg = escapeRegexp(Debuggable.INSTANTIATION_MESSAGE);
      expect(stripAnsi(consoleLogSpy.calls[0].args[0])).to.match(
        new RegExp(`^myApp:debuggable:constructor:[a-f0-9]{4} ${msg}$`),
      );
    });

    it('uses extended class name as namespace', function () {
      process.env.DEBUG = '*';
      class MyService extends Debuggable {}
      new MyService();
      expect(consoleLogSpy.callCount).to.equal(1);
      const msg = escapeRegexp(Debuggable.INSTANTIATION_MESSAGE);
      expect(stripAnsi(consoleLogSpy.calls[0].args[0])).to.match(
        new RegExp(`^myService:constructor:[a-f0-9]{4} ${msg}$`),
      );
    });

    describe('"namespace" option', function () {
      it('should use "namespace" option as the first namespace segment', function () {
        process.env.DEBUG = '*';
        new Debuggable({namespace: 'myApp'});
        expect(consoleLogSpy.callCount).to.equal(1);
        const msg = escapeRegexp(Debuggable.INSTANTIATION_MESSAGE);
        expect(stripAnsi(consoleLogSpy.calls[0].args[0])).to.match(
          new RegExp(`^myApp:debuggable:constructor:[a-f0-9]{4} ${msg}$`),
        );
      });
    });

    describe('"noEnvironmentNamespace" option', function () {
      it('should use DEBUGGER_NAMESPACE when the option "noEnvironmentNamespace" is false', function () {
        process.env.DEBUGGER_NAMESPACE = 'myApp';
        process.env.DEBUG = '*';
        new Debuggable({noEnvironmentNamespace: false});
        expect(consoleLogSpy.callCount).to.equal(1);
        const msg = escapeRegexp(Debuggable.INSTANTIATION_MESSAGE);
        expect(stripAnsi(consoleLogSpy.calls[0].args[0])).to.match(
          new RegExp(`^myApp:debuggable:constructor:[a-f0-9]{4} ${msg}$`),
        );
      });

      it('should skip DEBUGGER_NAMESPACE when the option "noEnvironmentNamespace" is true', function () {
        process.env.DEBUGGER_NAMESPACE = 'myApp';
        process.env.DEBUG = '*';
        new Debuggable({noEnvironmentNamespace: true});
        expect(consoleLogSpy.callCount).to.equal(1);
        const msg = escapeRegexp(Debuggable.INSTANTIATION_MESSAGE);
        expect(stripAnsi(consoleLogSpy.calls[0].args[0])).to.match(
          new RegExp(`^debuggable:constructor:[a-f0-9]{4} ${msg}$`),
        );
      });
    });

    describe('"noInstantiationMessage" option', function () {
      it('should hide instantiation message', function () {
        process.env.DEBUG = '*';
        new Debuggable({noInstantiationMessage: true});
        expect(consoleLogSpy.callCount).to.equal(0);
      });
    });
  });

  describe('getDebuggerFor', function () {
    it('returns a new debugger with method name segment and hash', function () {
      process.env.DEBUG = '*';
      class MyService extends Debuggable {
        myMethod() {
          const debug = this.getDebuggerFor(this.myMethod);
          debug('Message');
        }
      }
      const myService = new MyService();
      myService.myMethod();
      expect(consoleLogSpy.callCount).to.equal(2);
      expect(stripAnsi(consoleLogSpy.calls[1].args[0])).to.match(
        new RegExp(`^myService:myMethod:[a-f0-9]{4} Message$`),
      );
    });
  });
});
