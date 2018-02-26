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
    this._inActivePlayers = [];
    this.playerCount = 0;
    this.cardHandler = new CardHandler();
    this._murderCombination = {};
    this.started = false;
    this._path = new Path(1,78);
    this._turn = 1;
    this.getDate = getDate;
    this._activityLog = new ActivityLog(getDate);
    this._currentSuspicion = {};
    this._currentAccusation = {};
  }
  get turn() {
    return this._turn;
  }
  addPlayer(name, id) {
    let character = characterData[++this.playerCount];
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
  getActivePlayersPos(){
    return Object.values(this.players).map((player) => {
      let char = player.character;
      return {
        name: char.name,
        position: char.position,
        start: char.start
      };
    });
  }
  addInActivePlayers(){
    let totalChars = Object.keys(characterData).length;
    let playerCount = this.playerCount + 1;
    while (playerCount <= totalChars) {
      let char = characterData[playerCount];
      this._inActivePlayers.push({
        name: char.name,
        position: char.position,
        start: char.start
      });
      ++playerCount;
    }
  }
  getPlayersPosition() {
    let activePlayersPos =this.getActivePlayersPos();
    let nonActivePlayersPos = this._inActivePlayers;
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

  updateCharPosition(name,pos){
    this._inActivePlayers.find(char=>{
      if(char.name == name){
        char.position = pos;
        char.start = false;
      }
    });
  }
  updateSuspicionOf(id,combination) {
    let character = combination.character;
    let players = Object.values(this.players);
    let player = players.find(player => {
      return player.character.name == character.name;
    });
    let currentPlayer = this.getCurrentPlayer();
    let pos = currentPlayer.character.position;
    if (player){
      player.updatePos(pos);
    }else{
      this.updateCharPosition(character.name,pos);
    }
    let playerName = this.players[id].name;
    this._currentSuspicion = new Suspicion(combination,playerName);
    this.findCanceller(this.players[id]);
    this.playerMoved = true;
    return true;
  }
  pass() {
    let id = this.getCurrentPlayerId();
    this.players[id]._lastSuspicion = this._currentSuspicion;
    this.playerMoved = false;
    this.diceVal = undefined;
    this._currentSuspicion = {};
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
  findCanceller(currentPlayer){
    debugger;
    let suspicion = this._currentSuspicion;
    let turn = currentPlayer.character.turn;
    let nextTurn = this.getNextTurn(turn);
    while (turn != nextTurn) {
      let nextPlayer = this.getPlayerByTurn(nextTurn);
      if(nextPlayer.canCancel(suspicion)){
        suspicion.canBeCancelled = true;
        suspicion.cancellerName = nextPlayer.name;
        suspicion.canceller = this.getPlayerId(nextTurn);
        suspicion.cancellingCards = nextPlayer.getCancellingCards(suspicion);
        return;
      }
      nextTurn = this.getNextTurn(nextTurn);
    }
    suspicion.cancellingCards = [];
    suspicion.canBeCancelled = false;
  }
  getPlayerId(turn){
    let playerIds = Object.keys(this.players);
    return playerIds.find(id=>this.players[id].character.turn==turn);
  }
  getNextTurn(turn){
    let players = Object.values(this.players)
      .sort((player1,player2)=>player1.character.turn > player2.character.turn);
    let player = players.find(player =>player.character.turn > turn);
    if (!player) {
      player = players[0];
    }
    return player.character.turn;
  }
  isSuspecting() {
    return !this.isEmpty(this._currentSuspicion);
  }
  isEmpty(suspicion){
    return JSON.stringify(suspicion) == '{}';
  }
  getCombination(){
    let suspicion = this._currentSuspicion;
    if(this.isEmpty(suspicion)||!suspicion.combination.room){
      return {};
    }
    let combination = {
      room: suspicion.combination.room.name,
      weapon: suspicion.combination.weapon.name,
      character: suspicion.combination.character.name
    };
    return combination;
  }
  addActivity(activity){
    let timeOfActivity = this._activityLog.addActivity(activity);
    return timeOfActivity;
  }
  getSuspicion(playerId){
    let suspicion = this._currentSuspicion;
    let result = {
      combination : suspicion.combination,
      cancelled : suspicion.cancelled,
      cancelledBy : suspicion.cancellerName,
      canBeCancelled : suspicion.canBeCancelled
    };
    if(suspicion.canceller==playerId){
      result.cancellingCards = suspicion.cancellingCards;
    }
    if(playerId == this.getCurrentPlayerId()){
      result.ruleOutCard = suspicion.ruleOutCard;
    }
    return result;
  }
  getActivitesAfter(time, playerId) {
    let gameActivities = this._activityLog.getActivitesAfter(time);
    let playerLog = this.getPlayer(playerId).getActivitesAfter(time);
    let allLogs = Object.assign(gameActivities,playerLog);
    return allLogs;
  }
  canRuleOut(playerId, ruleOutCard){
    let suspicion = this.getSuspicion(playerId);
    let card = suspicion.cancellingCards.find(card=>card._name == ruleOutCard);
    return !!card;
  }
  ruleOut(card){
    let suspicion = this._currentSuspicion;
    let id = this.getCurrentPlayerId();
    this.getPlayer(id).addActivity(`Ruled out by ${
      suspicion.cancellerName} using ${card} card`);
    suspicion.cancelled = true;
    suspicion.ruleOutCard = card;
  }
  canSuspect(){
    let currentPlayer = this.getPlayer(this.getCurrentPlayerId());
    return currentPlayer.canSuspect();
  }
  isPlayerInRoom(){
    let currentPlayer = this.getPlayer(this.getCurrentPlayerId());
    return !!this._path.isRoom(currentPlayer.character.position);
  }
  createAccusation(combination){
    this._currentAccusation = new Suspicion(combination);
  }
}

module.exports = Game;
