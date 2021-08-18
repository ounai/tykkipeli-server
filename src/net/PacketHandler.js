'use strict';

const log = require('../Logger')('PacketHandler');
const { getFilenamesInDirectory } = require('../Utils');

class PacketHandler {
  #server;
  #packetHandlers;

  #registerPacketHandlers(packetHandlersPath) {
    log.info('Registering packet handlers...');

    for (const filename of getFilenamesInDirectory(`${packetHandlersPath}`, 'js')) {
      log.debug('Registering packet', filename);

      const Handler = require.main.require(`${packetHandlersPath}/${filename}`);

      this.#packetHandlers.push(new Handler(this.#server));
    }
  }

  constructor(server, ...packetHandlersPaths) {
    this.#server = server;
    this.#packetHandlers = [];

    for (const packetHandlersPath of packetHandlersPaths) {
      log.debug('Creating packet handler for path', packetHandlersPath);

      this.#registerPacketHandlers(packetHandlersPath);
    }
  }

  async onPacket(connection, packet) {
    let handled = false;

    for (const packetHandler of this.#packetHandlers) {
      if (packet.type === packetHandler.type && packetHandler.match(packet)) {
        log.debug('Packet matches', packetHandler.constructor.name);

        await packetHandler.handle(connection, packet);

        log.info(packetHandler.constructor.name, 'handled!');

        handled = true;
      }
    }

    if (!handled) log.debugError('Packet not handled!', packet);
  }
}

module.exports = PacketHandler;

