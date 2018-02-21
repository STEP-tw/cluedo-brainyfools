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
    this._murderCombination = {};
    this.started = false;
    this._turn = 1;
  }
  get turn() {
    return this._turn;
  }
  addPlayer(name, id) {
    let character = characterData[++this.playerCount];
    character = new Character(character);
    let player = new Player(name, character);
    this.players[id] = player;
  }
  getCurrentPlayer() {
    let playerId = this.getCurrentPlayerId();
    return this.getPlayerDetails(playerId);
  }
  getCurrentPlayerId() {
    let players = Object.keys(this.players);
    return players.find(playerId => {
      let player = this.players[playerId];
      return player.character.turn == this._turn;
    });
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
  isCurrentPlayer(playerId) {
    let player = this.getPlayer(playerId);
    return player && player.character.turn == this._turn;
  }

  getAllPlayerDetails(id) {
    let players = Object.keys(this.players);
    return players.reduce((details, playerId, index) => {
      let player = this.players[playerId];
      if (playerId == id) {
        details[id] = this.getPlayerData(playerId);
        return details;
      }
      details[index + 1] = this.getPlayerDetails(playerId);
      return details;
    }, {});
  }

  getPlayerData(id) {
    let player = this.players[id];
    let playerDetails = this.getPlayerDetails(id);
    playerDetails.cards = player._cards;
    return playerDetails;
  }
  getPlayerDetails(id) {
    let player = this.players[id];
    return {
      name: player.name,
      character: {
        name: player.character.name,
        color: player.character.tokenColor,
        turn: player.character.turn
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
    this.gatherRemainingCards();
    this.distributeCards();
    this.started = true;
  }
  setMurderCombination() {
    this._murderCombination = this.cardHandler.getRandomCombination();
  }
  getRandomCard(cards) {
    return this.cardHandler.getRandomCard(cards);
  }
  hasRemainingCard() {
    return this.cardHandler.hasRemainingCard();
  }
  distributeCards() {
    let playerIds = Object.keys(this.players);
    while (this.hasRemainingCard()) {
      let currentPlayerId = playerIds.shift();
      let currentPlayer = this.players[`${currentPlayerId}`];
      let remainingCards = this.cardHandler._remainingCards;
      currentPlayer.addCard(this.getRandomCard(remainingCards));
      playerIds.push(currentPlayerId);
    }
  }
  rollDice() {
    if (!this.diceVal) {
      this.diceVal = Math.ceil(Math.random() * 6);
    }
    return this.diceVal;
  }
  gatherRemainingCards() {
    this.cardHandler.gatherRemainingCards();
  }
  validateMove(pos) {
    let currentPlayerId = this.getCurrentPlayerId();
    let currentPlayer = this.getPlayer(currentPlayerId);
    let val = this.diceVal;
    currentPlayer.character.start && val--;
    let currentPlayerPos = currentPlayer.character.position;
    let forwardPos = (currentPlayerPos + val) % 78;
    let backPos = currentPlayerPos - val;
    forwardPos = forwardPos == 0 ? 1 : forwardPos;
    backPos = backPos < 1 ? 78 + backPos : backPos;
    return +pos == forwardPos || +pos == backPos;
  }

  updatePlayerPos(pos) {
    if (this.playerMoved) {
      return false;
    }
    let currentPlayerId = this.getCurrentPlayerId();
    this.playerMoved = true;
    let currentPlayer = this.getPlayer(currentPlayerId);
    return currentPlayer.updatePos(+pos);
  }

  pass() {
    this.playerMoved = false;
    this.diceVal = undefined;
    this._turn = this.getNextPlayerTurn();
  }

  getNextPlayerTurn() {
    let players = Object.values(this.players);
    let player = players.find(player => {
      return player.character.turn > this.turn;
    });
    if (!player) {
      player = players[0];
    }
    return player.character.turn;
  }
}

module.exports = Game;
