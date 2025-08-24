import {expect} from 'chai';
import {createSpy} from '@e22m4u/js-spy';
import {Service} from '@e22m4u/js-service';
import {escapeRegexp, stripAnsi} from '../utils/index.js';
import {DebuggableService} from './debuggable-service.js';

describe('DebuggableService', function () {
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
    const res = new DebuggableService();
    expect(typeof res.debug).to.be.eq('function');
  });

  describe('constructor', function () {
    it('extends the Service class', function () {
      const res = new DebuggableService();
      expect(res).to.be.instanceof(Service);
    });

    it('should output the specific message when instantiated', function () {
      process.env.DEBUG = '*';
      new DebuggableService();
      expect(consoleLogSpy.callCount).to.equal(1);
      const msg = escapeRegexp(DebuggableService.INSTANTIATION_MESSAGE);
      expect(stripAnsi(consoleLogSpy.getCall(0).args[0])).to.match(
        new RegExp(`debuggableService:constructor:[a-f0-9]{4} ${msg}`),
      );
    });
  });
});
