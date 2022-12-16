'use strict';

const path = require('path');
const chalk = require('chalk');

const InPacket = require('./packets/in/InPacket');

const config = require('../config');
const log = require('../Logger')('PacketHandler');
const { getFilenamesInDirectory } = require('../Utils');

// Names of packets that should not be logged
const noLogPackets = [];

if (config.logging.disablePing) {
  // Don't log handling of ping response packets
  noLogPackets.push('PongPacket');
}

class PacketHandler {
  #server;
  #packetHandlers;

  #registerPacketHandlers (packetHandlersPath) {
    log.debug('Registering packet handlers in', packetHandlersPath);

    const filenames = getFilenamesInDirectory(path.join(__dirname, packetHandlersPath), 'js');

    for (const filename of filenames) {
      log.debug('Registering packet', filename);

      // Load & instanciate handler class
      const Handler = require.main.require(path.join(__dirname, packetHandlersPath, filename));
      const handler = new Handler(this.#server);

      // Needs to inherit InPacket
      if (handler instanceof InPacket) {
        this.#packetHandlers.push(handler);
      } else {
        log.error('Invalid packet handler encountered:', handler);
      }
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

    // Handle with all matching packet handlers
    for (const packetHandler of this.#packetHandlers) {
      if (packet.type === packetHandler.type && packetHandler.match(packet)) {
        const packetName = packetHandler.constructor.name;
        const logPacket = !noLogPackets.includes(packetName);

        if (logPacket) log.debug('Packet matches', chalk.magenta(packetName));

        await packetHandler.handle(connection, packet);

        if (logPacket) log.debug(packetName, 'handled!');

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
