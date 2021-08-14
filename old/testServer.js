'use strict';

const net = require('net');

const serverIp = '51.195.222.59';
const port = 4242;

const enableBots = false;
const motd = 'Welcome!';

const roundAmmo = [
  [-1, 8, 4, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 3, 2, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 2, 2, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
  [0, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 2, 2, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 3, 2, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [0, 3, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 3, 2, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 2, 2, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 3, 2, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
  [0, 3, 2, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0],
  [0, 3, 2, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  [0, 3, 2, 2, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0]
];

const teleportsPerRound = 0.25;
const shieldsPerRound = 0.25;

const players = {};
const games = [];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function escapeStr(str) {
  return str.replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\n/g, '\\n');
}

function getUserTokenizedString(nick, flags = 'r', ranking = 0, locale = 'fi') {
  return `3:${nick}^${flags}^${ranking}^${locale}^-^-`;
};

function getAnonUsername() {
  return '~anonym-' + (randomInt(9000) + 1000);
}

function getPlayerId(inGameId) {
  for (let id in players) {
    if (players.inGameId === inGameId) {
      return id;
    }
  }
}

function formatPlayerInfo(player) {
  return `${player.inGameId}\t${player.nick}\t${player.clanName}\t${player.characterImage}`;
}

function formatPlayerInfoNoId(player) {
  return `${player.nick}\t${player.clanName}\t${player.characterImage}`;
}

function getCurrentGame(playerId) {
  const gameId = players[playerId].gameId;

  return games[gameId];
}

function addAmmo(ammo1, ammo2) {
  for (let i = 0; i < 18; i++) {
    if (ammo1[i] !== -1) {
      ammo1[i] += ammo2[i];
    }
  }

  return ammo1;
}

function getConstantAmmo(round) {
  return addAmmo(roundAmmo[0], roundAmmo[Math.min(round, roundAmmo.length - 1)]);
}

function getDecreasingAmmo(rounds) {
  // TODO test and commit
  const ammo = roundAmmo[0];

  for (let round = 1; round < rounds; round++) {
    ammo = addAmmo(ammo, roundAmmo[Math.min(round, roundAmmo.length - 1)]);
  }

  return ammo;
}

console.log('Initializing...');

// pings
setInterval(() => {
  for (let playerId in players) {
    if (players[playerId] && players[playerId].socket) {
      players[playerId].socket.write('c ping\r\n', 'utf8');
    }
  }
}, 5 * 1000);

const server = net.createServer(socket => {
  console.log('\nNew socket opened');

  let sentCount = 0, lastReceived = -1, id = null;

  const write = msg => {
    console.log(id, 'WRITE >>', escapeStr(msg));

    if (id) {
      if (!players[id]) {
        console.log(id, 'Player no longer exists');
        return;
      } else if (players[id].socket) players[id].socket.write(msg + '\r\n', 'utf8');
      else {
        console.log(id, 'No socket, retry in 10 seconds');

        setTimeout(() => {
          if (!players[id]) return;
          else if (players[id].socket) players[id].socket.write(msg + '\r\n', 'utf8');
          else {
            console.log(id, `Delivery failed twice for player ${id}, deleting them`);

            players[id] = null;
          }
        }, 10 * 1000);
      }
    } else socket.write(msg + '\r\n', 'utf8');
  };

  const writeData = msg => {
    write(`d ${sentCount++} ${msg}`);
  };

  const writeGameInfo = game => {
    writeData('game\tgameinfo\t' + [
      game.maxPlayers,
      game.rounds,
      game.name,
      game.passwordNeeded ? 't' : 'f',
      game.registeredOnly,
      game.weaponAddMode,
      game.playOrderMode,
      game.thinkTime,
      game.windMode,
      game.dudsEnabled ? 't' : 'f',
      game.scoringMode
    ].join('\t'));
  };

  const getGameListItem = game => {
    const playersInGame = Object.keys(players)
      .map(playerId => players[playerId])
      .filter(player => player && player.gameId === game.id)
      .map(player => player.nick)
      .join(', ');

    return [
      game.id,
      game.name,
      game.passwordNeeded ? 't' : 'f',
      game.registeredOnly,
      game.maxPlayers,
      game.rounds,
      game.weaponAddMode,
      game.playOrderMode,
      game.thinkTime,
      game.windMode,
      game.dudsEnabled ? 't' : 'f',
      game.scoringMode,
      'str2', // ???
      game.state === 'wait' ? 't' : 'f', // t = joinable, f = already started
      game.players, // players in lobby count
      playersInGame // players in lobby text
    ].join('\t');
  };

  const writeGameListAdd = (_writeData, game) => {
    _writeData(`lobby\tgamelist\tadd\t${getGameListItem(game)}`);
  };

  const startRound = player => {
    const gameId = players[player.id].gameId;

    players[player.id].health = 100;

    if (games[gameId].weaponAddMode === 0) {
      // Constant ammo
      players[player.id].ammo = getConstantAmmo(games[gameId].round);
    } else if (games[gameId].weaponAddMode === 1) {
      // Increasing ammo
      players[player.id].ammo = addAmmo(
        players[player.id].ammo,
        roundAmmo[Math.min(games[gameId].round, roundAmmo.length - 1)]
      );
    }

    if (games[gameId].round === 0) {
      // Add shields and teleports
      const shields = Math.ceil(games[gameId].rounds * shieldsPerRound);
      const teleports = Math.ceil(games[gameId].rounds * teleportsPerRound);

      const ammo = Array(18).fill(0);

      ammo[16] = shields;
      ammo[17] = teleports;

      players[player.id].ammo = addAmmo(players[player.id].ammo, ammo);
    }

    if (games[gameId].currentMap === null) {
      games[gameId].currentMap = randomInt(1000000);

      console.log(id, 'Map set to', games[gameId].currentMap);
    }

    player.writeData(`game\tstartround\t${games[gameId].currentMap}\t0`);
  };

  const startTurn = player => {
    const gameId = player.gameId;

    const speed = 500;
    const damage = 1000; // 750 for the authentic experience

    if (games[gameId].wind === null) {
      if (games[gameId].windMode === 0) games[gameId].wind = 0; // none
      else if (games[gameId].windMode === 1) games[gameId].wind = randomInt(50) - 25; // normal
      else if (games[gameId].windMode === 2) games[gameId].wind = randomInt(100) - 50; // random

      console.log(id, 'Set wind to', games[gameId].wind);
    }

    const wind = games[gameId].wind;

    players[player.id].action = null;

    if (player.health > 0) {
      player.writeData(
        `game\tstartturn\t${speed}\t${wind}\t${damage}\t1000\t${player.inGameId}\t${player.ammo.join('\t')}`
      );
    }
  };

  const joinLobby = () => {
    writeData('status\tlobby');

    players[id].state = 'lobby';

    const lobbyPlayerCount = Object.keys(players)
      .map(playerId => players[playerId])
      .filter(player => player && player.state === 'lobby')
      .length + 1;

    const gamePlayerCount = Object.keys(players)
      .map(playerId => players[playerId])
      .filter(player => player && (player.state === 'game' || player.state == 'wait'))
      .length;

    writeData(`lobby\townjoin\t${getUserTokenizedString(players[id].nick)}`);
    writeData(`lobby\tnumberofusers\t${lobbyPlayerCount}\t${gamePlayerCount}`);
    writeData(`lobby\tserversay\t${motd}`);

    // send full game list
    const allGames = games.filter(game => !!game);
    console.log(id, 'Sending full games list', allGames);

    if (allGames.length === 0) writeData('lobby\tgamelist\tfull\t0');
    else writeData(
      `lobby\tgamelist\tfull\t${allGames.length}\t`
      + allGames.map(getGameListItem).join('\t')
    );

    const nicksInLobby = Object.keys(players)
      .filter(playerId => players[playerId] && players[playerId].state === 'lobby')
      .map(playerId => players[playerId].nick);

    writeData(
      'lobby\tusers\t'
      + `${getUserTokenizedString('Rotannaama', 'rvs', 900)}\t`
      + `${getUserTokenizedString('autonrämä', 'rv', 10)}`
      + (nicksInLobby.length > 0 ? '\t' : '')
      + nicksInLobby.map(nick => getUserTokenizedString(nick)).join('\t')
    );
  };

  const startGame = () => {
    const gameId = players[id].gameId;

    console.log(id, 'Starting game', gameId);

    if (!games[gameId]) {
      console.log(id, 'Uh oh, that game does not exist :(');

      return;
    }

    games[gameId].state = 'game';

    for (let playerId in players) {
      const player = players[playerId];

      if (!player || player.gameId !== gameId) continue;

      players[playerId].wantsNewGame = false;
      players[playerId].state = 'game';

      if (games[gameId].weaponAddMode === -1) {
        players[playerId].ammo = getDecreasingAmmo(games[gameId].rounds);
      } else {
        players[playerId].ammo = Array(18).fill(0);
      }

      if (enableBots) {
        player.writeData(
          `game\tstartgame\t${players[player.id].inGameId}\t${games[gameId].players}\t`
          + formatPlayerInfoNoId(players[id]) + '\t'
          + games[gameId].bots.map(formatPlayerInfoNoId).join('\t')
        );
      } else {
        const gamePlayers = Object.keys(players).map(playerId => players[playerId]).filter(player => player && player.gameId === gameId);

        player.writeData(
          `game\tstartgame\t${players[player.id].inGameId}\t${games[gameId].players}\t`
          + gamePlayers
              .sort((a, b) => a.inGameId - b.inGameId)
              .map(formatPlayerInfoNoId)
              .join('\t')
        );
      }

      startRound(player);
      startTurn(player);
    }
  };

  socket.on('data', buffer => {
    const str = buffer.toString();

    // skip pongs
    if (str === 'c pong\r\n') return;

    console.log(id, 'READ  <<', escapeStr(str));

    for (let cmd of str.replace(/\n$/, '').split('\n')) {
      cmd = cmd.replace(/\r/g, '');

      console.log(id, 'CMD', `"${escapeStr(cmd)}"`);

      if (cmd.startsWith('c new')) {
        id = randomInt(1000000);

        players[id] = {
          id,
          nick: getAnonUsername(),
          clanName: '-',
          characterImage: '-',
          state: 'lobby',
          ready: false,
          action: null,
          wantsNewGame: false,
          ammo: Array(18).fill(0),
          health: 100,
          socket,
          writeData
        };

        write(`c id ${id}`);
      } else if (cmd.startsWith('c old')) {
        id = Number(cmd.split(' ')[2]);

        if (!players[id]) {
          console.log(id, 'No players entry');
          return;
        }

        players[id].socket = socket;
        players[id].writeData = writeData;
        players[id].state = players[id].stateWas;

        lastReceived = players[id].lastReceived;

        console.log(`Client ${id} reconnected`);

        write('c rcok'); // reconnect ok
      } else if (cmd.startsWith('d')) {
        // data command
        // d {count} {commandName}\t{data1}\t{data2}\t(etc...)
        const params = cmd.split(' ').slice(2).join(' ').split('\t');

        const packetNumber = Number(cmd.split(' ')[1]);

        if (packetNumber <= lastReceived) {
          console.log('Skipping duplicate packet');

          return;
        }

        lastReceived = packetNumber;

        if (players[id]) players[id].lastReceived = packetNumber;

        if (params[0] === 'version') {
          writeData('status\tlogin');
        } else if (params[0] === '_nick') {
          const nick = params[1];

          let canHave = true;

          for (let playerId in players) {
            if (players[playerId] && players[playerId].nick.toLowerCase() === nick.toLowerCase()) {
              canHave = false;
              break;
            }
          }

          if (canHave) players[id].nick = nick;
        } else if (params[0] === 'login') {
          writeData(`basicinfo\tt\t0\t3939\tt\tf`);

          joinLobby();
        } else if (params[0] === 'lobby' && params[1] === 'create') {
          const game = {
            name: params[2],
            password: params[3],
            registeredOnly: Number(params[4]),
            maxPlayers: Number(params[5]),
            rounds: Number(params[6]),
            weaponAddMode: Number(params[7]),
            playOrderMode: 1, //Number(params[8]),
            thinkTime: Number(params[9]),
            windMode: Number(params[10]),
            dudEnabled: Number(params[11]),
            scoringMode: Number(params[12]),
            wind: null,
            players: 0,
            round: 0,
            bots: [],
            state: 'wait',
            currentMap: null
          };

          if (game.name === '-') game.name = players[id].nick;
          game.passwordNeeded = (game.password !== '-');

          console.log(id, 'New game created:', game);

          games.push(game);

          const gameId = (games.length - 1);
          players[id].gameId = gameId;
          game.id = gameId;

          console.log(id, 'Added game', players[id].gameId);

          writeData('status\tgame');
          players[id].state = 'wait';

          writeGameInfo(games[gameId]);

          players[id].inGameId = games[gameId].players++;
          writeData(`game\towninfo\t${players[id].inGameId}\t${players[id].nick}\t-\t-`);

          if (enableBots) {
            // join bots
            for (let i = 0; i < games[gameId].maxPlayers - 1; i++) {
              const bot = {
                nick: getAnonUsername(),
                clanName: 'bot',
                characterImage: '-',
                type: 'random', // skip, copy, random
                inGameId: games[gameId].players++
              };

              games[gameId].bots.push(bot);

              setTimeout(() => {
                writeData(`game\tjoin\t${bot.inGameId}\t${bot.nick}\t${bot.clanName}\t-`);
                writeData(`game\treadytostart\t${bot.inGameId}`);

                setTimeout(() => {
                  writeData(`game\tsay\t${bot.nick}\tbeep boop`);
                }, 250);
              }, 1000 * (i + 1));
            }

            setTimeout(() => {
              startGame();

              for (let bot of getCurrentGame(id).bots) {
                writeData(`game\tready\t${bot.inGameId}`);
              }
            }, 1000 * (game.maxPlayers + 1));
          } else {
            // no bots
            for (let playerId in players) {
              if (Number(playerId) === id) continue;

              const player = players[playerId];

              if (player && player.state === 'lobby') {
                writeGameListAdd(player.writeData, games[gameId]);
              }
            }
          }
        } else if (params[0] === 'lobby' && params[1] === 'say') {
          const roomId = Number(params[2]);
          const message = params[3];

          for (let playerId in players) {
            if (Number(playerId) === id) continue;

            const player = players[playerId];

            if (player && player.state === 'lobby') {
              player.writeData(`lobby\tsay\t${roomId}\t${players[id].nick}\t${message}`);
            }
          }
        } else if (params[0] === 'lobby' && params[1] === 'sayp') {
          const from = players[id].nick;
          const to = params[2];
          const message = params[3];

          for (let playerId in players) {
            const player = players[playerId];

            if (player && player.state === 'lobby' && player.nick === to) {
              player.writeData(`lobby\tsayp\t${from}\t${message}`);
            }
          }
        } else if (params[0] === 'lobby' && params[1] === 'join') {
          const gameId = Number(params[2]);

          if (!games[gameId]) {
            console.log(id, 'Tried to join a game that does not exist:', gameId);

            return;
          }

          players[id].gameId = gameId;

          console.log(id, 'Joined game', players[id].gameId);

          writeData('status\tgame');
          players[id].state = 'wait';

          writeGameInfo(games[gameId]);

          players[id].inGameId = games[gameId].players++;
          writeData(`game\towninfo\t${players[id].inGameId}\t${players[id].nick}\t-\t-`);

          // other players
          const gamePlayers = Object.keys(players)
            .filter(playerId => Number(playerId) !== id && players[playerId].gameId === gameId)
            .map(playerId => players[playerId]);

          writeData(
            'game\tplayers\t'
            + gamePlayers.map(formatPlayerInfo).join('\t')
          );

          // send join info to other players
          for (let playerId in players) {
            if (Number(playerId) === id) continue;

            const player = players[playerId];

            if (player && player.gameId === gameId) {
              player.writeData(`game\tjoin\t${formatPlayerInfo(players[id])}`);
              player.writeData(`game\treadytostart\t${players[id].inGameId}`);
            }
          }
        } else if (params[0] === 'game' && params[1] === 'readytostart') {
          console.log(id, 'Ready to start game', players[id].gameId);

          players[id].readyToStart = true;

          if (players[id].inGameId === 0 && !enableBots) {
            startGame();
          }
        } else if (params[0] === 'game' && params[1] === 'action') {
          let actionId = Number(params[2]);
          let actionString = params.slice(3).join('\t');

          if (players[id].health <= 0) actionId = -1;

          if (actionId !== -1 && actionId !== 0) {
            if (players[id].ammo[actionId] > 0) players[id].ammo[actionId]--;
            else actionId = -1;
          }

          if (enableBots) {
            for (let bot of getCurrentGame(id).bots) {
              if (bot.type === 'skip') writeData(`game\taction\t${bot.inGameId}\t-1`);
              else if (bot.type === 'copy') {
                if (!actionString) writeData(`game\taction\t${bot.inGameId}\t${actionId}`);
                else writeData(`game\taction\t${bot.inGameId}\t${actionId}\t${actionString}`);
              } else if (bot.type === 'random') {
                writeData(`game\taction\t${bot.inGameId}\t0\t${randomInt(770)}\t${randomInt(200)}\t-1\t-1`);
              }
            }

            setTimeout(() => {
              writeData('game\tstartaction');
            }, (enableBots ? 500 : 0));
          }

          players[id].action = actionId + (actionString ? `\t${actionString}` : '');

          let canStartAction = true;

          for (let playerId in players) {
            if (players[playerId] && players[playerId].gameId === players[id].gameId) {
              if (!players[playerId].action && players[playerId].health > 0) {
                console.log(id, 'Cannot start action,', players[playerId].nick, 'is still thinking');

                canStartAction = false;
              }

              if (Number(playerId) === id) continue;

              players[playerId].writeData(`game\tready\t${players[id].inGameId}`);
            }
          }

          if (canStartAction) {
            for (let playerId in players) {
              if (players[playerId] && players[playerId].gameId === players[id].gameId) {
                for (let otherPlayerId in players) {
                  if (players[otherPlayerId] && players[otherPlayerId].gameId === players[id].gameId) {
                    if (players[otherPlayerId].action === null || players[otherPlayerId].action === undefined || players[otherPlayerId].health <= 0) {
                      players[otherPlayerId].action = '-1';
                    }

                    players[playerId].writeData(`game\taction\t${players[otherPlayerId].inGameId}\t${players[otherPlayerId].action}`);
                  }
                }

                setTimeout(() => {
                  players[playerId].writeData('game\tstartaction');
                }, 1000);
              }
            }
          }
        } else if (params[0] === 'game' && params[1] === 'result') {
          // first player in game decides
          if (players[id].inGameId === 0) {
            const gameId = players[id].gameId;
            const playerCount = games[gameId].players;

            if (games[gameId].windMode === 2) games[gameId].wind = null;

            const healths = [];
            
            for (let i = 0; i < playerCount; i++) {
              const health = Number(params[2 + i]);

              healths.push(health);

              for (let playerId in players) {
                const player = players[playerId];

                if (player && player.gameId === gameId && player.inGameId === i) {
                  player.health = health;
                }
              }
            }

            if (healths.filter(health => health > 0).length <= 1) {
              // next round
              games[gameId].round++;
              games[gameId].wind = null;
              games[gameId].currentMap = null;

              let winnerId = -1;

              for (let i = 0; i < healths.length; i++) {
                if (healths[i] > 0) winnerId = i;
              }

              for (let playerId in players) {
                const player = players[playerId];

                if (player.gameId === gameId) {
                  console.log(id, 'Going into the next round');

                  player.writeData(`game\tendround\t${games[gameId].round - 1}\t${winnerId}`);

                  if (games[gameId].round < games[gameId].rounds) {
                    startRound(player);
                    startTurn(player);
                  } else {
                    console.log(id, 'Game over');

                    player.writeData('game\tendgame');
                  }
                }
              }
            } else {
              // next turn
              if (enableBots) {
                setTimeout(() => {
                  startTurn(players[id]);

                  for (let bot of getCurrentGame(id).bots) {
                    writeData(`game\tready\t${bot.inGameId}`);
                  }
                }, 500);
              } else {
                for (let playerId in players) {
                  const player = players[playerId];

                  if (player && player.gameId === players[id].gameId) {
                    startTurn(player);
                  }
                }
              }
            }
          }
        } else if (params[0] === 'game' && params[1] === 'quit') {
          const gameId = players[id].gameId;
          games[gameId].players--;

          if (games[gameId].players === 0) {
            delete games[gameId];
            console.log(id, 'Deleted game', gameId, '=', games[gameId]);
            console.log(games);

            for (let playerId in players) {
              if (Number(playerId) === id) continue;

              const player = players[playerId];

              if (player && player.state === 'lobby') {
                player.writeData(`lobby\tgamelist\tremove\t${gameId}`);
              }
            }
          }

          joinLobby();

          for (let playerId in players) {
            if (Number(playerId) === id) continue;

            const player = players[playerId];

            if (player && player.gameId === gameId) {
              player.writeData(`game\tpart\t${players[id].inGameId}\t0`);
            }
          }
          
          players[id].gameId = null;
          players[id].inGameId = null;
        } else if (params[0] === 'game' && params[1] === 'say') {
          const message = params[2];

          for (let playerId in players) {
            if (Number(playerId) === id) continue;

            const player = players[playerId];

            if (player && player.gameId === players[id].gameId) {
              player.writeData(`game\tsay\t${players[id].nick}\t${message}`);
            }
          }
        } else if (params[0] === 'game' && params[1] === 'shout') {
          const message = params[2];

          for (let playerId in players) {
            if (Number(playerId) === id) continue;

            const player = players[playerId];

            if (player && player.gameId === players[id].gameId) {
              player.writeData(`game\tshout\t${players[id].inGameId}\t${message}`);
            }
          }
        } else if (params[0] === 'game' && params[1] === 'newgame') {
          players[id].wantsNewGame = true;

          let allAgree = true;

          for (let playerId in players) {
            const player = players[playerId];

            if (player && player.gameId === players[id].gameId && !player.wantsNewGame) {
              allAgree = false;
            }
          }

          for (let playerId in players) {
            if (Number(playerId) === id) continue;

            const player = players[playerId];

            if (player && player.gameId === players[id].gameId) {
              if (allAgree) startGame();
              else player.writeData(`game\twantnewgame\t${players[id].inGameId}`);
            }
          }
        } else console.log(id, 'unknown data command, params:', params);
      } else console.log(id, 'unknown command', cmd);
    }
  });

  socket.on('end', () => {
    console.log('Socket closed');

    if (id && players[id]) {
      players[id].socket = null;
      players[id].stateWas = players[id].state;
      players[id].state = 'dc';
    }
  });

  socket.on('error', err => {
    if (err.code === 'ECONNRESET') {
      console.log(id, 'Connection reset');

      if (id && players[id]) {
        players[id].socket = null;
        players[id].stateWas = players[id].state;
        players[id].state = 'dc';
      }
    } else console.log(id, 'Socket error:', err);
  });

  write('h 1');
  write(`c io ${randomInt(1000000000)}`);
  write('c crt 25');
  write('c ctr');
});

server.listen(port, serverIp, () => {
  console.log(`Listening on ${serverIp}:${port}`);
});

