import {expect} from 'chai';
import {stripAnsi} from './strip-ansi.js';

describe('stripAnsi', function () {
  it('should remove simple ANSI escape codes', function () {
    const coloredString = '\u001b[31mHello, world\u001b[39m';
    const result = stripAnsi(coloredString);
    expect(result).to.equal('Hello, world');
  });

  it('should handle strings without any ANSI codes', function () {
    const normalString = 'This is a normal string.';
    const result = stripAnsi(normalString);
    expect(result).to.equal('This is a normal string.');
  });

  it('should handle an empty string', function () {
    const emptyString = '';
    const result = stripAnsi(emptyString);
    expect(result).to.equal('');
  });

  it('should remove multiple ANSI codes from a string', function () {
    const multiColoredString =
      '\u001b[31mRed\u001b[39m and \u001b[34mblue\u001b[39m';
    const result = stripAnsi(multiColoredString);
    expect(result).to.equal('Red and blue');
  });

  it('should remove complex ANSI codes (with multiple parameters)', function () {
    const complexString = '\u001b[1;31mBold red text\u001b[0m';
    const result = stripAnsi(complexString);
    expect(result).to.equal('Bold red text');
  });

  it('should correctly handle a string containing only ANSI codes', function () {
    const onlyAnsi = '\u001b[31m\u001b[39m\u001b[1m';
    const result = stripAnsi(onlyAnsi);
    expect(result).to.equal('');
  });
});
