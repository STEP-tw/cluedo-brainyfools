const Player = require('./player.js');
const Character = require('./character.js');
const Path = require('./path.js');
const CardHandler = require('./cardHandler.js');
const characterData = require('./data/characterData.json');
const rooms = require('./data/roomData.json');
const ActivityLog = require('./activityLog');
const getTime = require('../utils/time.js');
const Suspicion = require('./suspicion.js');

class Game {
  constructor(numberOfPlayers, getDate = getTime) {
    this.numberOfPlayers = numberOfPlayers;
    this.players = {};
    this._unAssignedChars = [1, 2, 3, 4, 5, 6];
    this.playerCount = 0;
    this.cardHandler = new CardHandler();
    this._murderCombination = {};
    this.started = false;
    this._path = new Path(1, 86);
    this._turn;
    this._activePlayers=[];
    this._assignedChars=[];
    this.getDate = getDate;
    this._activityLog = new ActivityLog(getDate);
    this._currentSuspicion = {};
    this._currentAccusation = {};
    this._state = 'running';
    this._lastInactivePlayer = -1;
  }
  get turn() {
    return this._turn;
  }
  get state() {
    if (!this.getActivePlayers().length) {
      this._state = 'draw';
    }
    return this._state;
  }
  get murderCombination() {
    let combination = {
      room: this._murderCombination.room.name,
      weapon: this._murderCombination.weapon.name,
      character: this._murderCombination.character.name
    };
    return combination;
  }
  getRandomCharacterId() {
    let id = Math.floor(Math.random() * this._unAssignedChars.length);
    let index = this._unAssignedChars.splice(id , 1)[0];
    return index;
  }
  addPlayer(name, id, characterId) {
    let character = characterData[characterId];
    ++this.playerCount;
    this._activePlayers.push(characterId);
    this._assignedChars.push(characterId);
    character = new Character(character);
    let player = new Player(name, character, this.getDate);
    this.players[id] = player;
  }
  getCurrentPlayer() {
    let playerId = this.getCurrentPlayerId();
    return playerId && this.getPlayerDetails(playerId);
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
    let cards = player._cards.map((originalCard) => {
      let card = {};
      card.name = originalCard._name;
      card.type = originalCard._type;
      return card;
    });
    playerDetails.cards = cards;
    return playerDetails;
  }

  getPlayerDetails(id) {
    let player = this.players[id];
    return {
      name: player.name,
      inRoom: player.inRoom,
      character: {
        name: player.characterName,
        color: player.tokenColor,
        turn: player.turn,
        position: player.position
      }
    };
  }
  getActivePlayersPos() {
    return Object.values(this.players).map((player) => {
      let char = player.character;
      return {
        name: char.name,
        position: char.position
      };
    });
  }
  addInActivePlayers() {
    this._unAssignedChars = this._unAssignedChars.map((id) => {
      let char = characterData[id];
      return {
        name: char.name,
        position: char.position,
        inactive: true
      };
    });
  }
  getPlayersPosition() {
    let activePlayersPos = this.getActivePlayersPos();
    let nonActivePlayersPos = this._unAssignedChars;
    let allChars = [...activePlayersPos, ...nonActivePlayersPos];
    return allChars;
  }
  hasStarted() {
    return this.started;
  }
  start() {
    this.setMurderCombination();
    this.gatherRemainingCards();
    this.distributeCards();
    this.addInActivePlayers();
    this._path.addRooms(rooms);
    this.setTurn();
    this.addActivity("Game has started");
    this.started = true;
  }
  setTurn(){
    this._turn=this._activePlayers.sort()[0];
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
      let currentPlayer = this.players[currentPlayerId];
      let remainingCards = this.cardHandler._remainingCards;
      currentPlayer.addCard(this.getRandomCard(remainingCards));
      playerIds.push(currentPlayerId);
    }
  }
  rollDice() {
    if (!this.diceVal) {
      this.diceVal = Math.ceil(Math.random() * 6);
    }
    let id = this.getCurrentPlayerId();
    this.players[id].played();
    return this.diceVal;
  }
  gatherRemainingCards() {
    this.cardHandler.gatherRemainingCards();
  }
  validateMove(pos) {
    let player = this.getCurrentPlayerId();
    let val = this.diceVal;
    let curPlayerPos = this.players[player].character.position;
    return this._path.validateMove(pos, curPlayerPos, val);
  }
  getInvalidMoves() {
    let rooms = ['Hall', 'Kitchen', 'Conservatory', 'Ballroom',
      'Billiard', 'Dining', 'Study', 'Library', 'Lounge'
    ];
    return [...rooms, ...this._path.cells].filter(pos => {
      return !this.validateMove(pos);
    });
  }
  updatePlayerPos(pos) {
    let player = this.getCurrentPlayer();
    let currentPlayerId = this.getCurrentPlayerId();
    if(player.character.turn == this._turn ){
      this.players[currentPlayerId].played();
    }
    if (this.playerMoved) {
      return false;
    }
    let currentPlayer = this.getPlayer(currentPlayerId);
    let room = this._path.getRoom(pos);
    currentPlayer.inRoom = !!room;
    this.playerMoved = true;
    return currentPlayer.updatePos(pos);
  }

  updateCharPosition(name, pos) {
    this._unAssignedChars.find(char => {
      if (char.name == name) {
        char.position = pos;
        char.inactive = false;
      }
    });
  }
  movePlayerToken(combination) {
    let character = combination.character;
    let players = Object.values(this.players);
    let player = players.find(player => {
      return player.character.name == character.name;
    });
    let currentPlayer = this.getCurrentPlayer();
    let pos = currentPlayer.character.position;
    if (player) {
      player.updatePos(pos);
    } else {
      this.updateCharPosition(character.name, pos);
    }
  }
  updateSuspicionOf(id, combination) {
    this.movePlayerToken(combination);
    let playerName = this.players[id].name;
    this.players[id].played();
    this._currentSuspicion = new Suspicion(combination, playerName);
    this.findCanceller(this.players[id]);
    this.playerMoved = true;
    return true;
  }
  pass() {
    if (!this.canPass()) {
      return;
    }
    let id = this.getCurrentPlayerId();
    this.players[id]._lastSuspicion = this._currentSuspicion;
    this.players[id].played(false);
    this.playerMoved = false;
    this.diceVal = undefined;
    this._currentSuspicion = {};
    this._currentAccusation = {};
    this._turn = this.getNextPlayerTurn();
    return true;
  }

  canPass() {
    let id = this.getCurrentPlayerId();
    return this.players[id].hasPlayed();
  }

  getNextPlayerTurn() {
    let series = this._activePlayers.sort();
    let turn = series.indexOf(this.turn);
    if(this._lastInactivePlayer >=0){
      turn = this._lastInactivePlayer - 1;
      this._activePlayers.splice(this._lastInactivePlayer,1);
      this._lastInactivePlayer = -1;
    }
    return series[turn+1] || series[0] || 0;
  }
  getActivePlayers() {
    let players = Object.values(this.players);
    return players.filter((player) => {
      return player.isActive();
    });
  }
  getPlayerByTurn(turn) {
    let players = Object.values(this.players);
    return players.find(player => {
      return player.character.turn == turn;
    });
  }
  findCanceller(currentPlayer) {
    let suspicion = this._currentSuspicion;
    let turn = currentPlayer.character.turn;
    let nextTurn = this.getNextTurn(turn);
    while (turn != nextTurn) {
      let nextPlayer = this.getPlayerByTurn(nextTurn);
      if (nextPlayer.canCancel(suspicion)) {
        suspicion.canBeCancelled = true;
        suspicion.cancellerName = nextPlayer.name;
        suspicion.canceller = this.getPlayerId(nextTurn);
        suspicion.cancellingCards = nextPlayer.getCancellingCards(suspicion);
        if (nextPlayer._hasLeft) {
          let cards = suspicion.cancellingCards;
          let randomCard=cards[Math.floor(Math.random()*cards.length)];
          this.ruleOut(randomCard.name);
        }
        return;
      }
      nextTurn = this.getNextTurn(nextTurn);
    }
    suspicion.cancellingCards = [];
    suspicion.canBeCancelled = false;
    this.addActivity('No one ruled out');
  }
  getPlayerId(turn) {
    let playerIds = Object.keys(this.players);
    return playerIds.find(id => this.players[id].character.turn == turn);
  }
  getNextTurn(turn) {
    let series = this._assignedChars.sort();
    let turnIndex = series.indexOf(turn);
    return series[turnIndex+1] || series[0];
  }
  isSuspecting() {
    return !this.isEmpty(this._currentSuspicion);
  }
  isAccusing() {
    return !this.isEmpty(this._currentAccusation);
  }
  isEmpty(suspicion) {
    return JSON.stringify(suspicion) == '{}';
  }
  getCombination(accusation) {
    let suspicion = accusation || this._currentSuspicion;
    if (this.isEmpty(suspicion) || !suspicion.combination.room) {
      return {};
    }
    let combination = {
      room: suspicion.combination.room.name,
      weapon: suspicion.combination.weapon.name,
      character: suspicion.combination.character.name
    };
    return combination;
  }

  getAccuseCombination() {
    let accusation = this._currentAccusation;
    return this.getCombination(accusation);
  }
  addActivity(activity, colour) {
    let timeOfActivity = this._activityLog.addActivity(activity, colour);
    return timeOfActivity;
  }
  getSuspicion(playerId) {
    let suspicion = this._currentSuspicion;
    let result = {
      combination: suspicion.combination,
      cancelled: suspicion.cancelled,
      cancelledBy: suspicion.cancellerName,
      canBeCancelled: suspicion.canBeCancelled,
      currentPlayer: suspicion.suspector
    };
    if (suspicion.canceller == playerId) {
      result.cancellingCards = suspicion.cancellingCards;
    }
    if (playerId == this.getCurrentPlayerId()) {
      if (suspicion.ruleOutCard) {
        result.ruleOutCard = suspicion.ruleOutCard.name;
        result.ruleOutCardType = suspicion.ruleOutCard.type;
      } else {
        result.ruleOutCard = suspicion.ruleOutCard;
      }
      result.suspector = suspicion.suspector;
    }
    return result;
  }
  getActivitiesAfter(time, playerId) {
    let gameActivities = this._activityLog.getActivitiesAfter(time);
    let playerLog = this.getPlayer(playerId).getActivitiesAfter(time);
    let allLogs = [...gameActivities, ...playerLog];
    return allLogs;
  }
  canRuleOut(playerId, ruleOutCard) {
    let suspicion = this.getSuspicion(playerId);
    let card = suspicion.cancellingCards.find(card=>card._name == ruleOutCard);
    return !!card;
  }
  ruleOut(card) {
    let suspicion = this._currentSuspicion;
    let cardEntity = suspicion.cancellingCards.find(
      ruleOutCard => ruleOutCard._name == card);
    let id = this.getCurrentPlayerId();
    this.getPlayer(id).addActivity(`Ruled out by ${
      suspicion.cancellerName} using ${cardEntity.name} card`);
    suspicion.cancelled = true;
    suspicion.ruleOutCard = cardEntity;
  }
  canSuspect() {
    let currentPlayer = this.getPlayer(this.getCurrentPlayerId());
    return currentPlayer.canSuspect();
  }
  isPlayerInRoom() {
    let currentPlayer = this.getPlayer(this.getCurrentPlayerId());
    return !!this._path.isRoom(currentPlayer.character.position);
  }
  accuse(combination) {
    this._currentSuspicion = {};
    this.movePlayerToken(combination);
    let id = this.getCurrentPlayerId();
    let player = this.players[id];
    player.played();
    let name = player.name;
    this._currentAccusation = new Suspicion(combination, name);
    if (this.isCorrectAccusation()) {
      this._state = 'win';
      this.addActivity(`${name} has won the game`);
    } else {
      player.deactivate();
      this._lastInactivePlayer = this._activePlayers.indexOf(this._turn);
      this.addActivity(`${name} accusation failed`);
    }
    return true;
  }
  isCorrectAccusation() {
    let combination = this._currentAccusation.combination;
    return this._murderCombination.isEqualTo(combination);
  }
  getAccusationState() {
    if (!this.isEmpty(this._currentAccusation)) {
      return !this.isCorrectAccusation();
    }
    return false;
  }
  getPlayersStatus() {
    let playersStatus = {};
    Object.keys(this.players).forEach(id => {
      let player = this.players[id];
      playersStatus[player.character.turn] = player.isActive();
    });
    return playersStatus;
  }
  getSecretPassage() {
    let player = this.getCurrentPlayer();
    if (player.inRoom) {
      return this._path.getConnectedRoom(player.character.position);
    }
    return '';
  }
  shutPlayerDown(id) {
    let player = this.getPlayerDetails(id);
    this.addActivity(`${player.name} left the game`);
    let turn = player.character.turn;
    let index = this._activePlayers.indexOf(turn);
    if (turn==this._turn) {
      this._turn = this._activePlayers[index+1];
    }
    this._activePlayers.splice(index,1);
    return this.players[id].shutDown();
  }
}

module.exports = Game;
