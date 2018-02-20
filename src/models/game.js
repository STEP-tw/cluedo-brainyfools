const Player = require('./player.js');
const Character = require('./character.js');
const CardHandler = require('./cardHandler.js');
const characterData = require('../data/characterData.json');

class Game {
  constructor(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers;
    this.players = {};
    this.playerCount = 0;
    this.cardHandler = new CardHandler();
    this.murderCombination = {};
    this.started = false;
    this._turn = 1;
  }
  addPlayer(name, id) {
    let character = characterData[++this.playerCount];
    character = new Character(character);
    let player = new Player(name, character);
    this.players[id] = player;
  }
  getMurderCombination() {
    return this.murderCombination;
  }
  getCurrentPlayer() {
    let players = Object.keys(this.players);
    let playerId = players.find(playerId => {
      let player = this.players[playerId];
      return player.character.turn == this._turn;
    });

    return this.getPlayerDetails(playerId);
  }
  getPlayerCount() {
    return this.playerCount;
  }
  getPlayer(playerId) {
    return this.players[playerId];
  }
  haveAllPlayersJoined() {
    return this.numberOfPlayers == this.playerCount;
  }
  isCurrentPlayer(playerId){
    let player = this.getPlayer(playerId);
    return player && player.character.turn == this._turn;
  }
  getAllPlayerDetails(Id) {
    let players = Object.keys(this.players);
    return players.reduce((details, playerId, index) => {
      let player = this.players[playerId];
      let id = playerId == Id ? Id : index + 1;
      details[id] = this.getPlayerDetails(playerId);
      return details;
    }, {});
  }
  getPlayerDetails(id) {
    let player = this.players[id];
    return {
      name: player.name,
      character: {
        name: player.character.name,
        color: player.character.tokenColor,
        turn:player.character.turn
      }
    };
  }
  getPlayersPosition() {
    return Object.values(this.players).map((player) => {
      let char = player.character;
      return {
        name: char.name,
        position: char.position,
        start: char.start
      };
    });
  }
  hasStarted() {
    return this.started;
  }
  start() {
    this.setMurderCombination();
    this.started = true;
  }
  setMurderCombination() {
    this.murderCombination = this.cardHandler.getRandomCombination();
  }
  rollDice() {
    if (!this.diceVal) {
      this.diceVal = Math.ceil(Math.random() * 6);
    }
    return this.diceVal;
  }
}

module.exports = Game;
