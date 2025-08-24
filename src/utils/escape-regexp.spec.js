import {expect} from 'chai';
import {escapeRegexp} from './escape-regexp.js';

describe('escapeRegexp', function () {
  it('should not change a string with no special characters', function () {
    // проверяем, что обычная строка без спецсимволов не изменяется
    const input = 'hello world';
    const expected = 'hello world';
    expect(escapeRegexp(input)).to.equal(expected);
  });

  it('should escape all special regex characters', function () {
    // проверяем, что все специальные символы для RegExp корректно экранируются
    const input = '.*+?^${}()|[]\\';
    const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';
    expect(escapeRegexp(input)).to.equal(expected);
  });

  it('should escape a string containing a URL', function () {
    // проверяем экранирование в строке, которая является URL-адресом
    const input = 'http://example.com?query=a+b';
    const expected = 'http://example\\.com\\?query=a\\+b';
    expect(escapeRegexp(input)).to.equal(expected);
  });

  it('should escape characters within a mixed string', function () {
    // проверяем, что символы экранируются правильно внутри обычной строки
    const input = 'a (very) important string [_v2.0_]';
    const expected = 'a \\(very\\) important string \\[_v2\\.0_\\]';
    expect(escapeRegexp(input)).to.equal(expected);
  });

  it('should correctly escape backslashes', function () {
    // отдельно проверяем правильное экранирование обратных слэшей
    const input = 'C:\\Users\\Test';
    const expected = 'C:\\\\Users\\\\Test';
    expect(escapeRegexp(input)).to.equal(expected);
  });

  it('should handle an empty string', function () {
    // проверяем, что пустая строка обрабатывается корректно
    const input = '';
    const expected = '';
    expect(escapeRegexp(input)).to.equal(expected);
  });

  it('should convert non-string input to a string and escape it', function () {
    // тест с числом, которое содержит специальный для RegExp символ '.'
    const inputNumber = 123.45;
    const expectedNumber = '123\\.45';
    expect(escapeRegexp(inputNumber)).to.equal(expectedNumber);

    // тест с null.
    const inputNull = null;
    const expectedNull = 'null';
    expect(escapeRegexp(inputNull)).to.equal(expectedNull);

    // тест с undefined.
    const inputUndefined = undefined;
    const expectedUndefined = 'undefined';
    expect(escapeRegexp(inputUndefined)).to.equal(expectedUndefined);
  });

  it('should correctly create a usable RegExp object after escaping', function () {
    // проверяем, что после экранирования мы можем
    // создать рабочее регулярное выражение
    const dangerousString = 'search(v1.0)';
    const escapedString = escapeRegexp(dangerousString);
    const regex = new RegExp(escapedString);

    // убедимся, что экранированная строка имеет ожидаемый вид
    expect(escapedString).to.equal('search\\(v1\\.0\\)');

    // созданный RegExp должен находить точное совпадение с исходной строкой
    expect(regex.test('search(v1.0)')).to.be.true;

    // и он не должен находить совпадения там, где символы могут
    // быть неверно интерпретированы как операторы
    expect(regex.test('search(v1a0)')).to.be.false;
  });
});
