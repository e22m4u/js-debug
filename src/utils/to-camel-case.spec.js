import {expect} from 'chai';
import {toCamelCase} from './to-camel-case.js';

describe('toCamelCase', function () {
  it('returns a camelCase string', function () {
    expect(toCamelCase('TestString')).to.be.eq('testString');
    expect(toCamelCase('test-string')).to.be.eq('testString');
    expect(toCamelCase('test string')).to.be.eq('testString');
    expect(toCamelCase('Test string')).to.be.eq('testString');
  });
});
