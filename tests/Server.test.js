'use strict';

const Server = require('../src/Server');

const PacketHandler = require('../src/net/PacketHandler');
jest.mock('../src/net/PacketHandler');

const ConnectionHandler = require('../src/net/ConnectionHandler');
jest.mock('../src/net/ConnectionHandler');

const Pinger = require('../src/net/Pinger');
jest.mock('../src/net/Pinger');

const getConfig = serverFields => ({
  server: {
    ip: '1.2.3.4',
    port: 10,
    inPacketPaths: ['test-path-1', 'test-path-2'],
    pingIntervalSeconds: 30,
    ...serverFields
  }
});

describe('server initialization', () => {
  let config;

  beforeEach(() => {
    config = getConfig();

    PacketHandler.mockClear();
    ConnectionHandler.mockClear();
  });

  it('fails when invalid or no config is given', () => {
    expect(() => new Server()).toThrow(Error);
    expect(() => new Server({})).toThrow(Error);
    expect(() => new Server({ server: {} })).toThrow(Error);
  });

  it('fails when ip is invalid', () => {
    [
      null,
      123,
      '',
      '1.2.3.4.5',
      '.1.2.3.4.',
      '1234.1.1.1',
      '1.1.1.1234'
    ].forEach(invalidIp => {
      expect(() => new Server(getConfig({ ip: invalidIp })))
        .toThrowError(/Invalid ip/);
    });
  });

  it('fails when port is invalid', () => {
    [
      null,
      NaN,
      '',
      -1,
      0,
      65536
    ].forEach(invalidPort => {
      expect(() => new Server(getConfig({ port: invalidPort })))
        .toThrowError(/Invalid port/);
    });
  });

  it('creates a packet handler', () => {
    const server = new Server(config);

    expect(PacketHandler)
      .toHaveBeenCalledWith(server, ...config.server.inPacketPaths);

    expect(server.connectionHandler)
      .toBeInstanceOf(ConnectionHandler);
  });

  it('creates a connection handler', () => {
    new Server(config);

    expect(ConnectionHandler)
      .toHaveBeenCalledWith(config.server.ip, config.server.port);
  });
});

describe('motd', () => {
  it('returns motd when set', () => {
    const motd = 'test motd string';

    expect(new Server(getConfig({ motd })).motd)
      .toEqual(motd);
  });

  it('returns null motd when not set or empty', () => {
    expect(new Server(getConfig()).motd)
      .toBeNull();

    expect(new Server(getConfig({ motd: '' })).motd)
      .toBeNull();
  });
});

describe('listen', () => {
  let config;

  beforeEach(() => {
    config = getConfig();

    Pinger.mockClear();
    ConnectionHandler.mockClear();
  });

  it('calls connection handler to start listening', () => {
    new Server(config).listen();

    expect(ConnectionHandler.mock.instances[0].listen)
      .toHaveBeenCalledTimes(1);
  });

  it('creates a pinger instance', () => {
    const server = new Server(config);

    server.listen();

    expect(Pinger)
      .toHaveBeenCalledWith(server, config.server.pingIntervalSeconds);
  });
});
