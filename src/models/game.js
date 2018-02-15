const Player = require('./player.js');
const Character = require('./character.js');
const characterData = require('../data/characterData.json');

class Game {
  constructor(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers;
    this.players = {};
    this.count=1;
  }
  addPlayer(name,id){
    let character = characterData[this.count++];
    let player = new Player(name,character);
    this.players[id] = player;
  }
}

module.exports = Game;
