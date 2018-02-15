const Player = require('./player.js');
class Game {
  constructor(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers;
    this.players = {};
  }
}

module.exports = Game;
