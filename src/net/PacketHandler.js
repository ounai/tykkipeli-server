'use strict';

const chalk = require('chalk');

const InPacket = require('./packets/in/InPacket');

const log = require('../Logger')('PacketHandler');
const { getFilenamesInDirectory } = require('../Utils');

class PacketHandler {
  #server;
  #packetHandlers;

  #registerPacketHandlers (packetHandlersPath) {
    log.debug('Registering packet handlers in', packetHandlersPath);

    const filenames = getFilenamesInDirectory(`${packetHandlersPath}`, 'js');

    for (const filename of filenames) {
      log.debug('Registering packet', filename);

      const Handler = require.main.require(`${packetHandlersPath}/${filename}`);
      const handler = new Handler(this.#server);

      if (handler instanceof InPacket) this.#packetHandlers.push(handler);
      else log.error('Invalid packet handler encountered:', handler);
    }
  }

  constructor (server, ...packetHandlersPaths) {
    this.#server = server;
    this.#packetHandlers = [];

    log.info('Registering packet handlers...');

    for (const packetHandlersPath of packetHandlersPaths) {
      log.debug('Creating packet handler for path', packetHandlersPath);

      this.#registerPacketHandlers(packetHandlersPath);
    }
  }

  async onPacket (connection, packet) {
    let handled = false;

    for (const packetHandler of this.#packetHandlers) {
      if (packet.type === packetHandler.type && packetHandler.match(packet)) {
        log.debug('Packet matches', packetHandler.constructor.name);

        await packetHandler.handle(connection, packet);

        log.info(packetHandler.constructor.name, 'handled!');

        handled = true;
      }
    }

    if (!handled) {
      log.debugError(
        'Packet not handled!',
        chalk.magenta(packet.type.toString()),
        packet.args
      );
    }
  }
}

module.exports = PacketHandler;
