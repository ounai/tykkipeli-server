'use strict';

const ConnectionCount = require('../src/ConnectionCount');

describe('isFull', () => {
  it('returns false when connections do not exceed limit', () => {
    const connectionCount = new ConnectionCount(2);

    connectionCount.onConnect();

    expect(connectionCount.isFull()).toEqual(false);
  });

  it('returns true when connections exceed limit', () => {
    const connectionCount = new ConnectionCount(2);

    connectionCount.onConnect();
    connectionCount.onConnect();

    expect(connectionCount.isFull()).toEqual(true);
  });
});

describe('onConnect', () => {
  it('increments connections', () => {
    const connectionCount = new ConnectionCount();

    expect(connectionCount.connections).toEqual(0);
    connectionCount.onConnect();
    expect(connectionCount.connections).toEqual(1);
  });

  it('does not exceed the limit', () => {
    const connectionCount = new ConnectionCount(1);

    connectionCount.onConnect();
    expect(connectionCount.connections).toEqual(1);
    connectionCount.onConnect();
    expect(connectionCount.connections).toEqual(1);
  });
});

describe('onDisconnect', () => {
  it('decrements connections', () => {
    const connectionCount = new ConnectionCount();

    connectionCount.onConnect();
    expect(connectionCount.connections).toEqual(1);
    connectionCount.onDisconnect();
    expect(connectionCount.connections).toEqual(0);
  });

  it('throws error when called at zero connections', () => {
    const connectionCount = new ConnectionCount();

    expect(() => connectionCount.onDisconnect())
      .toThrowError();
  });
});

describe('toString', () => {
  it('returns a string representation of current connection count', () => {
    const connectionCount = new ConnectionCount(2);

    expect(connectionCount.toString()).toEqual('Connections: 0 / 2');

    connectionCount.onConnect();
    connectionCount.onConnect();

    expect(connectionCount.toString()).toEqual('Connections: 2 / 2');
  });
});
