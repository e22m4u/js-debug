import {expect} from 'chai';
import {isNonArrayObject} from './is-non-array-object.js';

describe('isNonArrayObject', function () {
  it('returns true for non-array object', function () {
    expect(isNonArrayObject({})).to.be.true;
    expect(isNonArrayObject({foo: 'bar'})).to.be.true;
    expect(isNonArrayObject(Object.create(null))).to.be.true;
    expect(isNonArrayObject(new Date())).to.be.true;
  });

  it('returns false for array and non-object values', function () {
    expect(isNonArrayObject('')).to.be.false;
    expect(isNonArrayObject('str')).to.be.false;
    expect(isNonArrayObject(0)).to.be.false;
    expect(isNonArrayObject(10)).to.be.false;
    expect(isNonArrayObject(true)).to.be.false;
    expect(isNonArrayObject(false)).to.be.false;
    expect(isNonArrayObject([])).to.be.false;
    expect(isNonArrayObject([1, 2, 3])).to.be.false;
    expect(isNonArrayObject(undefined)).to.be.false;
    expect(isNonArrayObject(null)).to.be.false;
    expect(isNonArrayObject(() => undefined)).to.be.false;
  });
});
