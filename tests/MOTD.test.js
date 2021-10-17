'use strict';

const MOTD = require('../src/MOTD');

describe('constructor', () => {
  it('sets a MOTD given to the constructor', () => {
    const str = 'test motd 123';
    const motd = new MOTD(str);

    expect(motd.isSet()).toEqual(true);
    expect(motd.toString()).toEqual(str);
  });

  it('does not set MOTD if it is invalid or empty', () => {
    [null, 123, true, NaN, ''].forEach(invalidValue => {
      const motd = new MOTD(invalidValue);

      expect(motd.isSet()).toEqual(false);
      expect(motd.toString()).toEqual('-');
    });
  });
});

describe('setMOTD', () => {
  it('sets the MOTD', () => {
    const motd = new MOTD();
    const str = 'test motd 456';

    motd.setMOTD(str);

    expect(motd.isSet()).toEqual(true);
    expect(motd.toString()).toEqual(str);
  });

  it('throws error when given MOTD is invalid', () => {
    const motd = new MOTD();

    [null, 123, true, NaN, ''].forEach(invalidValue => {
      expect(() => motd.setMOTD(invalidValue))
        .toThrowError(/Invalid MOTD/);

      expect(motd.isSet()).toEqual(false);
      expect(motd.toString()).toEqual('-');
    });
  });
});
