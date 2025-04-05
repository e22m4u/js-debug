import {expect} from 'chai';
import {generateRandomHex} from './generate-random-hex.js';

describe('generateRandomHex', function () {
  it('returns string with specified length', function () {
    expect(generateRandomHex(10)).to.have.lengthOf(10);
    expect(generateRandomHex(1)).to.have.lengthOf(1);
    expect(generateRandomHex()).to.have.lengthOf(4);
    expect(generateRandomHex(0)).to.have.lengthOf(0);
    expect(generateRandomHex(-5)).to.have.lengthOf(0);
  });

  it('returns unique string', function () {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(generateRandomHex(8));
    }
    expect(results.size).to.equal(100);
  });

  it('does not start with a digit', function () {
    const iterations = 200;
    const digits = '0123456789';
    for (let i = 0; i < iterations; i++) {
      const lengthsToTest = [1, 5, 10];
      for (const len of lengthsToTest) {
        const res = generateRandomHex(len);
        if (res.length > 0) {
          const firstChar = res[0];
          expect(
            digits.includes(firstChar),
            `String "${res}" started with a digit`,
          ).to.be.false;
        } else {
          expect(res).to.equal('');
        }
      }
    }
  });

  it('returns valid hex characters', function () {
    const iterations = 50;
    const validHexRegex = /^[a-f0-9]*$/;
    for (let i = 0; i < iterations; i++) {
      const res = generateRandomHex(12);
      expect(
        validHexRegex.test(res),
        `String "${res}" contains non-hex characters`,
      ).to.be.true;
    }
  });
});
