const Player = require('./player.js');
const Character = require('./character.js');
const characterData = require('../data/characterData.json');

class Game {
  constructor(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers;
    this.players = {};
    this.playerCount=0;
  }
  addPlayer(name,id){
    let character = characterData[++this.playerCount];
    character=new Character(character,this.playerCount);
    let player = new Player(name,character);
    this.players[id] = player;
  }
  getPlayer(playerId){
    return this.players[playerId];
  }
}

module.exports = Game;
