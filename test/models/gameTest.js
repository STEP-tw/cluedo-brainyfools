const chai = require('chai');
const assert = chai.assert;
const Game = require('../../src/models/game.js');
const ActivityLog = require('../../src/models/activityLog.js');
const Combination = require('../../src/models/combination');
const Player = require('../../src/models/player.js');
const Card = require('../../src/models/card.js');
const Suspicion = require('../../src/models/suspicion.js')

let getTime = function(start){
  return ()=>start++;
};

describe('Game', () => {
  let game;
  beforeEach(() => {
    game = new Game(3, getTime(1));
  });

  describe('#addPlayer', () => {
    it('should create new player with diff. characters', () => {
      game.addPlayer("suyog", 1);
      game.addPlayer("omkar", 2);
      let actualOutput = game.players[1];
      let expectedOutput = {
          "_name":"Miss Scarlett",
          "_tokenColor":"#bf0000",
          "_position":69,
          "_turn":1
        };
      assert.deepEqual(actualOutput.character, expectedOutput);
    });
  });


  describe('#getPlayer', () => {
    it('should return player by his/her id', () => {
      game.addPlayer("suyog", 1);
      game.addPlayer("omkar", 2);
      let player = game.getPlayer(1);
      assert.equal(player.name, 'suyog');
    });
  });


  describe('#getPlayerCount', () => {
    it('should return count of players joined', () => {
      game.addPlayer("suyog", 1);
      game.addPlayer("omkar", 2);
      let playerCount = game.getPlayerCount();
      assert.equal(playerCount, 2);
    });
  });


  describe('#haveAllPlayersJoined', function () {
    it('should return true when game is ready to start', function () {
      game.addPlayer("Pranav", 1);
      game.addPlayer("Patel", 2);
      game.addPlayer("JD", 3);
      assert.isOk(game.haveAllPlayersJoined());
    });

    it('should return false when isnt ready to start', function () {
      game.addPlayer("Pranav", 1);
      game.addPlayer("Patel", 2);
      assert.isNotOk(game.haveAllPlayersJoined());
    });
  });

  describe('#getAllPlayerDetails', function () {
    it('should return details of 1 players', function () {
      game.addPlayer("Madhuri", 1);
      let expected = {
        1: {
          name: "Madhuri",
          inRoom: false,
          character: {
            name: "Miss Scarlett",
            color: "#bf0000",
            turn:1,
            position:69
          },
          cards:[]
        }
      };

      assert.deepEqual(game.getAllPlayerDetails(1), expected);
    });
    it('should return empty for no players', function () {
      let expected = {
      };
      assert.deepEqual(game.getAllPlayerDetails(0), expected);
    });
    it('should return details of 2 players', function () {
      game.addPlayer("Madhuri", 2);
      game.addPlayer("Neeraj", 23);
      let expected = {
        1: {
          name: "Madhuri",
          inRoom: false,
          character: {
            name: "Miss Scarlett",
            color: "#bf0000",
            turn:1,
            position:69
          }
        },
        23: {
          name: "Neeraj",
          cards:[],
          inRoom: false,
          character: {
            "color": "#ffdb58",
            "name": "Col. Mustard",
            turn:2,
            position:56
          }
        }
      };
      assert.deepEqual(game.getAllPlayerDetails(23), expected);
    });
  });

  describe("#getCurrentPlayer", () => {
    it("should return id of player according to turn", () => {
      game.addPlayer("Suyog", 1);
      game.addPlayer("Bhanu", 2);
      game.addPlayer("Omkar", 3);
      assert.deepEqual(game.getCurrentPlayer(), {
        name: 'Suyog',
        inRoom: false,
        character: {
          "color": "#bf0000",
          "name": "Miss Scarlett",
          'turn':1,
          position:69
        }
      });
    });
  });
  describe('#getPlayersPosition', function () {
    it('should return all player\'s positions', function () {
      game.addPlayer("Pranav", 1);
      game.addPlayer("Patel", 2);
      let actualOutput = game.getPlayersPosition();
      let expected = [
        {
          name: "Miss Scarlett",
          position: 69
        },
        {
          "name": "Col. Mustard",
          position: 56
        }
      ];
      assert.deepEqual(actualOutput, expected);
    });
  });

  describe('#hasGameStarted', function () {
    it('should return true when game has started', function () {
      assert.isNotOk(game.hasStarted());
      game.addPlayer('Patel',205);
      game.start();
      assert.isOk(game.hasStarted());
    });
  });

  describe('#selectMurderCombination', function () {
    it('should select murder combination', function () {
      let roomCards = game.cardHandler.rooms;
      let weaponCards = game.cardHandler.weapons;
      let characterCards = game.cardHandler.characters;
      game.setMurderCombination();

      let murderCombination = game._murderCombination;

      assert.notDeepInclude(roomCards, murderCombination.room);
      assert.notDeepInclude(weaponCards, murderCombination.weapon);
      assert.notDeepInclude(characterCards, murderCombination.character);
    });
  });
  describe('#rollDice', () => {
    it('should return value ranging from 1 to 6', () => {
      for (let index = 0; index < 10; index++) {
        let val = game.rollDice();
        assert.isAbove(val, 0);
        assert.isBelow(val, 7);
      }
    });
  });

  describe('#collectRemainingCards', function(){
    it('should collect remaining cards', function(){
      let rooms = game.cardHandler.rooms;
      let weapons = game.cardHandler.weapons;
      let characters = game.cardHandler.characters;
      let allCards = [...rooms,...weapons,...characters];
      game.gatherRemainingCards();
      assert.deepEqual(allCards,game.cardHandler._remainingCards);
      assert.deepEqual(game.cardHandler.rooms,[]);
      assert.deepEqual(game.cardHandler.weapons,[]);
      assert.deepEqual(game.cardHandler.characters,[]);
    });
  });

  describe('#getRandomCard', function(){
    it('should return random card from remaining card', function(){
      let rooms = game.cardHandler.rooms;
      let weapons = game.cardHandler.weapons;
      let characters = game.cardHandler.characters;
      let allCards = [...rooms,...weapons,...characters];
      game.gatherRemainingCards();
      let randomCard = game.getRandomCard(allCards);
      assert.notDeepInclude(randomCard,allCards);
    });
  });

  describe('#hasRemainingCard', function(){
    it('should check wheather it has any remaining card', function(){
      assert.isNotOk(game.hasRemainingCard());
      game.gatherRemainingCards();
      assert.isOk(game.hasRemainingCard());
    });
  });

  describe('#distributeCards', function(){
    it('should distribute cards among all players', function(){
      game.addPlayer('Patel',1);
      game.addPlayer('Pranav',2);
      assert.isNotOk(game.hasRemainingCard());
      game.gatherRemainingCards();
      assert.isOk(game.hasRemainingCard());
      game.distributeCards();
      assert.isNotOk(game.hasRemainingCard());
    });
  });

  describe('#isCurrentPlayer', () => {
    it('should return true for first player', () => {
      game.addPlayer("Pranav", 1);
      game.addPlayer("Patel", 2);
      assert.isOk(game.isCurrentPlayer(1));
    });
    it('should return false for other player', () => {
      game.addPlayer("Pranav", 1);
      game.addPlayer("Patel", 2);
      assert.isFalse(game.isCurrentPlayer(2));
    });
  });
  describe('#validateMove', () => {
    it('should return true for valid forward move', () => {
      game.addPlayer("Pranav", 1);
      game.diceVal = 1;
      assert.isOk(game.validateMove(70));
      game.diceVal = 2;
      assert.isOk(game.validateMove(71));
      game.diceVal = 5;
      assert.isOk(game.validateMove(74));
      game.diceVal = 1;
      game.players[1].updatePos(86);
      assert.isOk(game.validateMove(1));
    });
    it('should return true for valid backward move', () => {
      game.addPlayer("Pranav", 1);
      game.diceVal = 2;
      assert.isOk(game.validateMove(67));
      game.diceVal = 3;
      game.players[1].updatePos(4);
      assert.isOk(game.validateMove(1));
    });
    it('should return false for invalid forward move', () => {
      game.addPlayer("Pranav", 1);
      game.diceVal = 1;
      assert.isNotOk(game.validateMove(4));
      game.diceVal = 2;
      assert.isNotOk(game.validateMove(6));
      game.diceVal = 5;
      assert.isNotOk(game.validateMove(1));
    });
    it('should return false for invalid backward move', () => {
      game.addPlayer("Pranav", 1);
      game.diceVal = 2;
      assert.isNotOk(game.validateMove(76));
      game.diceVal = 5;
      assert.isNotOk(game.validateMove(62));
    });
    it('should return false for moving to same room',()=>{
      game.addPlayer('Raghu',1);
      game.start();
      game.diceVal = 1;
      game.players[1].updatePos('hall');
      assert.isNotOk(game.validateMove('hall'));
      assert.isOk(game.validateMove('53'));
    });
    it('should return false for moving to invalid room',()=>{
      game.addPlayer('Raghu',1);
      game.start();
      game.diceVal = 1;
      game.players[1].updatePos('hall');
      assert.isNotOk(game.validateMove('lounge'));
    });
    it('should return true if player selected valid connected room from room',()=>{
      game.addPlayer('Raghu',1);
      game.start();
      game.diceVal = 2;
      game.players[1].updatePos('lounge');
      assert.isOk(game.validateMove('conservatory'));
      game.players[1].updatePos('conservatory');
      assert.isOk(game.validateMove('lounge'));
      game.players[1].updatePos('kitchen');
      assert.isOk(game.validateMove('study'));
      game.players[1].updatePos('study');
      assert.isOk(game.validateMove('kitchen'));
    });
  });

  describe('#getPlayerdata', function(){
    it('should return player data of given id', function(){
      game.addPlayer("Pranav", 1);
      game.addPlayer("Madhuri", 2);
      game.addPlayer("Patel",3);
      game.setMurderCombination();
      game.gatherRemainingCards();
      game.distributeCards();
      let pranavCards = game.getPlayerData(1).cards;
      assert.equal(pranavCards.length,6);
      assert.deepEqual(Object.keys(pranavCards[1]),['name','type']);
    });
  });

  describe('#updatePlayerPos',()=>{
    it('should update player\'s position',()=>{
      game.addPlayer("Pranav", 1);
      game.diceVal = 2;
      assert.isOk(game.updatePlayerPos(75));
      let player = game.players[1];
      let characterPos = player.character.position;
      assert.equal(characterPos,75);
      assert.isFalse(player.character.start);
    });
    it('should return false if already moved',()=>{
      game.addPlayer("Pranav", 1);
      game.diceVal = 2;
      game.updatePlayerPos(2);
      assert.isFalse(game.updatePlayerPos(3));
    });
  });

  describe('#isSuspecting',()=>{
    it('should give true if player is suspecting',()=>{
      game.addPlayer("Pranav", 1);
      let combination = {
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      };
      game.updateSuspicionOf(1,combination);
      assert.ok(game.isSuspecting());
    });
    it('should give false if player is not suspecting',()=>{
      game.addPlayer("Pranav", 1);
      assert.isNotOk(game.isSuspecting());
    });
  });

  describe('#getCurrentSuspicion',()=>{
    it('should give suspicion combination',()=>{
      game.addPlayer("Pranav", 1);
      let combination = {
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      };

      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Hall", 'Room');
      let combinationO = new Combination(room, weapon, character);
      game.updateSuspicionOf(1,combinationO);
      assert.deepEqual(game.getCombination(),combination);
    });
    it('should give empty object if combination is not defined',()=>{
      game.addPlayer("Pranav", 1);
      assert.deepEqual(game.getCombination(),{});
    });
  });

  describe('#addActivity', function(){
    it('should add activity to the activityLog', function(){
      let activityTime = game.addActivity('activity 1');
      let activities = game._activityLog.activities;
      assert.deepEqual(activities[0],{ time: 1, activity: 'activity 1' });
    });
  });

  describe('#getActivitiesAfter', function(){
    it('should return all activities after given time', function(){
      game.addPlayer("Pranav",1);
      game.addActivity('activity 1');
      game.addActivity('activity 2');
      game.addActivity('activity 3');
      let expected = [
        {time:2,activity:'activity 2'},
        {time:3,activity:'activity 3'}
      ];
      assert.deepEqual(game.getActivitiesAfter(1, 1),expected)
    });
  });

  describe('#start', function(){
    it('should start the game', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      assert.isNotOk(game.hasStarted());
      game.start();
      assert.isOk(game.hasStarted());
      let activities = game.getActivitiesAfter(0, 1)
      let expectedActivities = [{
        time:1,
        activity:'Game has started'
      }];
      assert.deepEqual(expectedActivities,activities);
    });
  });

  describe('#getNextPlayerTurn', function(){
    it('should give the next player', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      assert.isNotOk(game.hasStarted());
      game.start();
      assert.isOk(game.hasStarted());
      game._turn = 1;
      assert.equal(game.getNextPlayerTurn(),2);
      game._turn = 2;
      assert.equal(game.getNextPlayerTurn(),3);
      game._turn = 3;
      assert.equal(game.getNextPlayerTurn(),1);
    });
  });

  describe('#getPlayerId', function(){
    it('should give id of a player', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      assert.equal(game.getPlayerId(1),1);
      assert.equal(game.getPlayerId(2),2);
      assert.equal(game.getPlayerId(3),3);
    });
  });

  describe('#updateCharPosition',()=>{
    it('should update given character position',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      game.start();
      game.updateCharPosition('Rev. Green',3);
      assert.deepInclude(game._unAssignedChars,{ name: 'Rev. Green', position: 3, inactive: false });
    });
  });

  describe('#canRuleOut',()=>{
    it('should return false if player can not rule out',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination,'Patel');
      currentSuspicion.canceller = 1;
      currentSuspicion.cancellingCards = [weapon];
      game._currentSuspicion = currentSuspicion;
      assert.isNotOk(game.canRuleOut(1,'Hall'));
    });

    it('should return true if player can rule out',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination,'Patel');
      currentSuspicion.canceller = 1;
      currentSuspicion.cancellingCards = [room];
      game._currentSuspicion = currentSuspicion;
      assert.isOk(game.canRuleOut(1,'Lounge'));
    });
  });

  describe('#ruleOut',()=>{
    it('should set cancelled as true and ruleOutCard as given card',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination,'Patel');
      game._currentSuspicion = currentSuspicion;
      game.ruleOut(weapon);
      assert.isOk(currentSuspicion.cancelled);
      assert.deepEqual(currentSuspicion.ruleOutCard,weapon);
    });
  });

  describe('#findCanceller',()=>{
    it('should set canceller in suspicion',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination,'Patel');
      game._currentSuspicion = currentSuspicion;
      let start = 1;
      let player = new Player('Patel',{
        "name":"Col. Mustard",
        "color":"#ffdb58",
        "position":11,
        "start":true,
        "turn" : 2
      },()=>start++);
      game.players['1'].addCard(weapon);
      game.findCanceller(player);
      assert.isOk(currentSuspicion.canBeCancelled);
      assert.equal(currentSuspicion.cancellerName,'Pranav');
      assert.equal(currentSuspicion.canceller,1);
      assert.deepEqual(currentSuspicion.cancellingCards,[weapon]);
    });

    it('should set canceller in suspicion',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination,'Patel');
      game._currentSuspicion = currentSuspicion;
      let start = 1;
      let player = new Player('Patel',{
        "name":"Col. Mustard",
        "color":"#ffdb58",
        "position":11,
        "start":true,
        "turn" : 2
      },()=>start++);
      game.findCanceller(player);
      assert.isNotOk(currentSuspicion.canBeCancelled);
      assert.deepEqual(currentSuspicion.cancellingCards,[]);
    });
  });

  describe('#accuse',()=>{
    it('should raise an accusation',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      game._murderCombination = new Combination(room,weapon,character);
      let combination = new Combination(room, weapon, character);
      assert.isOk(game.accuse(combination));
    });
  });

  describe('#getAccuseCombination',()=>{
    it('should return an accuse combination which has been raised',()=>{
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("AJ",3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      game._murderCombination = new Combination(room,weapon,character);
      let combination = new Combination(room, weapon, character);
      assert.isOk(game.accuse(combination));
      let expected = {
        character : 'Dr. Orchid',
        room : 'Lounge',
        weapon : 'Revolver',
      };
      assert.deepEqual(game.getAccuseCombination(),expected);
    });
  });

  describe('#isCorrectAccusation',()=>{
    it('should return false if given combination is not same as murder combination', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentAccusation = new Suspicion(combination,'Patel');
      game._currentAccusation = currentAccusation;
      room = new Card("Hall", 'Room');
      combination = new Combination(room, weapon, character);
      game._murderCombination = combination;
      assert.isNotOk(game.isCorrectAccusation());
    });

    it('should return true if given combination is same as murder combination', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentAccusation = new Suspicion(combination,'Patel');
      game._currentAccusation = currentAccusation;
      game._murderCombination = combination;
      assert.isOk(game.isCorrectAccusation());
    });
  });

  describe('#getAccusationState', function(){
    it('should return false if current accusation is empty', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      assert.isNotOk(game.getAccusationState());
    });

    it('should return state if current accusation is not empty', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentAccusation = new Suspicion(combination,'Patel');
      game._currentAccusation = currentAccusation;
      game._murderCombination = combination;
      assert.isOk(game.getAccusationState());
      room = new Card("Hall", 'Room');
      combination = new Combination(room, weapon, character);
      game._murderCombination = combination;
      assert.isNotOk(game.getAccusationState());
    });
  });

  describe('#getActivePlayers', function(){
    it('should return active players', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      let players = [game.players[1],game.players[2]];
      assert.deepEqual(players,game.getActivePlayers());
      game.players[1].deactivate();
      players = [game.players[2]];
      assert.deepEqual(players,game.getActivePlayers());
    });
  });

  describe('#Pass', function(){
    it('should return true if turn is passed', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.start();
      assert.isOk(game.pass());
    });

    it('should return false if turn is not passed', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.start();
      game.players[1].deactivate();
      game.players[2].deactivate();
      assert.isNotOk(game.pass());
    });
  });

  describe('#isSameDistance', function(){
    it('should return true if same numbers are given', function(){
      assert.isOk(game.isSameDistance(1,1));
      assert.isOk(game.isSameDistance(0,0));
    });
    it('should return false if different numbers are given', function(){
      assert.isNotOk(game.isSameDistance(1,2));
      assert.isNotOk(game.isSameDistance(3,2));
    });
  });

  describe('#murderCombination', function(){
    it('should return murder combination', function(){
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      game._murderCombination = new Combination(room, weapon, character);
      assert.deepEqual(game.murderCombination,{"character": "Dr. Orchid",
      "room": "Lounge","weapon": "Revolver"});
    });
  });
});
