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

// eslint-disable-next-line max-lines-per-function
describe('server initialization', () => {
  let config;

  beforeEach(() => {
    config = getConfig();

    PacketHandler.mockClear();
    ConnectionHandler.mockClear();
  });

  it('fails when invalid or no config is given', async () => {
    await expect(() => new Server().init())
      .rejects.toThrow(Error);

    await expect(() => new Server().init({}))
      .rejects.toThrow(Error);

    await expect(() => new Server().init({ server: {} }))
      .rejects.toThrow(Error);
  });

  it('fails when ip is invalid', async () => {
    const invalidIps = [
      null,
      123,
      '',
      '1.2.3.4.5',
      '.1.2.3.4.',
      '1234.1.1.1',
      '1.1.1.1234'
    ];

    for (const invalidIp of invalidIps) {
      await expect(() => new Server().init(getConfig({ ip: invalidIp })))
        .rejects.toThrowError(/Invalid ip/);
    }
  });

  it('fails when port is invalid', async () => {
    const invalidPorts = [
      null,
      NaN,
      '',
      -1,
      0,
      65536
    ];

    for (const invalidPort of invalidPorts) {
      await expect(() => new Server().init(getConfig({ port: invalidPort })))
        .rejects.toThrowError(/Invalid port/);
    }
  });

  it('creates a packet handler', async () => {
    const server = new Server();
    await server.init(config);

    expect(PacketHandler)
      .toHaveBeenCalledWith(server, ...config.server.inPacketPaths);

    expect(server.connectionHandler)
      .toBeInstanceOf(ConnectionHandler);
  });

  it('creates a connection handler', async () => {
    const server = new Server();
    await server.init(config);

    expect(ConnectionHandler)
      .toHaveBeenCalledWith(config.server.ip, config.server.port);
  });
});

describe('listen', () => {
  let config;

  beforeEach(() => {
    config = getConfig();

    Pinger.mockClear();
    ConnectionHandler.mockClear();
  });

  it('calls connection handler to start listening', async () => {
    const server = new Server();
    await server.init(config);
    server.listen();

    expect(ConnectionHandler.mock.instances[0].listen)
      .toHaveBeenCalledTimes(1);
  });

  it('creates a pinger instance', async () => {
    const server = new Server();
    await server.init(config);
    server.listen();

    expect(Pinger)
      .toHaveBeenCalledWith(server.connectionHandler, config.server.pingIntervalSeconds);
  });
});
