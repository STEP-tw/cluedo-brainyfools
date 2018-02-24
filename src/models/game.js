const Player = require('./player.js');
const Character = require('./character.js');
const Path = require('./path.js');
const CardHandler = require('./cardHandler.js');
const characterData = require('./data/characterData.json');
const rooms = require('./data/roomData.json');
const ActivityLog = require('./activityLog');
const getTime = require('../utils/time.js');

class Game {
  constructor(numberOfPlayers, getDate = getTime) {
    this.numberOfPlayers = numberOfPlayers;
    this.players = {};
    this.playerCount = 0;
    this.cardHandler = new CardHandler();
    this._murderCombination = {};
    this.started = false;
    this._path = new Path(1,78);
    this._turn = 1;
    this._activityLog = new ActivityLog(getDate);
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
    let cards = player._cards.map((originalCard)=>{
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
        name: player.character.name,
        color: player.character.tokenColor,
        turn: player.character.turn,
        position: player.character.position
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
    this._path.addRooms(rooms);
    this.addActivity("Game has started");
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
    return this.diceVal;
  }
  gatherRemainingCards() {
    this.cardHandler.gatherRemainingCards();
  }
  getDistances(curPlayerPos,pos){
    let cells = this._path.cells;
    let forwardDistance = this._path.distanceForward(cells,+curPlayerPos,+pos);
    let backDistance = this._path.distanceBack(cells,+curPlayerPos,+pos);
    return [forwardDistance,backDistance];
  }
  /*eslint-disable */
  validateMove(pos){
    let player = this.getCurrentPlayerId();
    let atStart = this.players[player].character.start;
    let val = this.diceVal - atStart;
    let clickpos = pos;
    let curPlayerPos = this.players[player].character.position;
    let inRoom = false;
    if(curPlayerPos == pos && !atStart){
      return false;
    }
    if(this._path.isRoom(curPlayerPos)){
      inRoom = true;
      curPlayerPos = this._path.doorPositionOf(curPlayerPos);
      val--;
    }
    if(this._path.isRoom(pos)){
      pos = this._path.doorPositionOf(pos);
      !inRoom && val--;
    }
    let distances = this.getDistances(curPlayerPos,pos);
    let args = {
      val:val,
      curPlayerPos: +curPlayerPos,
      clickpos: clickpos,
      forwardDis: distances[0],
      backDis: distances[1],
      atStart: atStart
    };
    return this.validatePos(args);
  }

  isSameDistance(forwardDistance,backDistance){
    return forwardDistance == backDistance;
  }

  validatePos(args){
    let forwardDis = args.forwardDis;
    let backDis = args.backDis;
    if(this._path.canGoToConnectedRoom(args.val,args.clickpos,args.curPlayerPos)){
      return true;
    }
    if(forwardDis > args.val && backDis > args.val) {
      return false;
    }
    if(args.val == forwardDis || args.val == backDis){
      return true;
    }
    return (this._path.canEnterIntoRoom(args)) ||
    (this.isSameDistance(forwardDis,backDis) && args.atStart && (args.val == 1))
    || this._path.canGoToConnectedRoom(args.clickpos,args.curPlayerPos);
  }
  /*eslint-enable */
  updatePlayerPos(pos) {
    if (this.playerMoved) {
      return false;
    }
    let currentPlayerId = this.getCurrentPlayerId();
    let currentPlayer = this.getPlayer(currentPlayerId);
    let room = this._path.getRoom(pos);
    currentPlayer.inRoom = !!room;
    this.playerMoved = true;
    return currentPlayer.updatePos(pos);
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
  getPlayerByTurn(turn){
    let players = Object.values(this.players);
    return players.find(player => {
      return player.character.turn == turn;
    });
  }
  updateSuspicionOf(id,combination) {
    let character = combination.character;
    let players = Object.values(this.players);
    let player = players.find(player => {
      return player.character.name == character;
    });
    if (player){
      player.character.position = combination.room;
    }
    this.players[id].updateSuspicion(combination);
    this.findSuspicionCanceller(this.players[id]);
    return true;
  }
  findSuspicionCanceller(currentPlayer){
    debugger;
    let suspicion = this.getCurrentSuspicion();
    let turn = currentPlayer.character.turn;
    let nextTurn = this.getNextTurn(turn);
    while (turn != nextTurn) {
      let nextPlayer = this.getPlayerByTurn(nextTurn);
      if(nextPlayer.canCancel(suspicion)){
        suspicion.cancelled = false;
        suspicion.canBeCancelled = true;
        suspicion.canceller = this.getPlayerId(nextTurn);
        suspicion.cancellingCards = nextPlayer.getCancellingCards(suspicion);
        return;
      }
      nextTurn = this.getNextTurn(nextTurn);
    }
    suspicion.cancelled = false;
    suspicion.canBeCancelled = false;
  }
  getPlayerId(turn){
    let playerIds = Object.keys(this.players);
    return playerIds.find(id=>this.players[id].character.turn==turn);
  }
  getNextTurn(turn){
    let players = Object.values(this.players);
    let player = players.find(player => {
      return player.character.turn > turn;
    });
    if (!player) {
      player = players[0];
    }
    return player.character.turn;
  }
  isSuspecting() {
    let id=this.getCurrentPlayerId();
    let player = this.players[id];
    return player.isSuspecting();
  }
  getCurrentSuspicion() {
    let id=this.getCurrentPlayerId();
    return this.players[id].getSuspicion();
  }
  getSuspicionCombination(){
    let id=this.getCurrentPlayerId();
    let player = this.players[id];
    return player.getSuspicionCombination();
  }
  addActivity(activity){
    let timeOfActivity = this._activityLog.addActivity(activity);
    return timeOfActivity;
  }
  getSuspicion(playerId){
    let suspicion = this.getCurrentSuspicion();
    let result = {
      combination : suspicion.combination,
      cancelled : suspicion.cancelled,
      canBeCancelled : suspicion.canBeCancelled
    }
    if(suspicion.canceller==playerId){
      result.cancellingCards = suspicion.cancellingCards;
    }
    return result;
  }
  getActivitesAfter(time) {
    return this._activityLog.getActivitesAfter(time);
  }
}

module.exports = Game;
