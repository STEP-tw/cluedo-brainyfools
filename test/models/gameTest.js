const chai = require('chai');
const assert = chai.assert;
const Game = require('../../src/models/game.js');
const ActivityLog = require('../../src/models/activityLog.js');
const Combination = require('../../src/models/combination');
const Player = require('../../src/models/player.js');
const Card = require('../../src/models/card.js');
const Suspicion = require('../../src/models/suspicion.js')

let getTime = function(start) {
  return () => start++;
};

describe('Game', () => {
  let game;
  beforeEach(() => {
    game = new Game(3, getTime(1));
  });

  describe('#addPlayer', () => {
    it('should create new player with diff. characters', () => {
      game.addPlayer("suyog", 1, 1);
      game.addPlayer("omkar", 2, 2);
      let actualOutput = game.players[1];
      let expectedOutput = {
        "_name": "Miss Scarlett",
        "_tokenColor": "#bf0000",
        "_position": 69,
        "_turn": 1
      };
      assert.deepEqual(actualOutput.character, expectedOutput);
    });
  });

  describe('#getPlayer', () => {
    it('should return player by his/her id', () => {
      game.addPlayer("suyog", 1, 1);
      game.addPlayer("omkar", 2, 2);
      let player = game.getPlayer(1);
      assert.equal(player.name, 'suyog');
    });
  });

  describe('#getPlayerCount', () => {
    it('should return count of players joined', () => {
      game.addPlayer("suyog", 1, 1);
      game.addPlayer("omkar", 2, 2);
      let playerCount = game.getPlayerCount();
      assert.equal(playerCount, 2);
    });
  });
  describe('#getRandomCharacterId', () => {
    it('should return character ID in range of 1 to 6', () => {
      let index=game.getRandomCharacterId();
      assert.oneOf(index,[1,2,3,4,5,6]);
    });
  });

  describe('#haveAllPlayersJoined', function() {
    it('should return true when game is ready to start', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("JD", 3, 3);
      assert.isOk(game.haveAllPlayersJoined());
    });

    it('should return false when isnt ready to start', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Pranav", 1, 1);
      assert.isNotOk(game.haveAllPlayersJoined());
    });
  });

  describe('#getAllPlayerDetails', function() {
    it('should return details of 1 players', function() {
      game.addPlayer("Madhuri", 1, 1);
      let expected = {
        1: {
          name: "Madhuri",
          inRoom: false,
          character: {
            name: "Miss Scarlett",
            color: "#bf0000",
            turn: 1,
            position: 69
          },
          cards: []
        }
      };

      assert.deepEqual(game.getAllPlayerDetails(1), expected);
    });
    it('should return empty for no players', function() {
      let expected = {};
      assert.deepEqual(game.getAllPlayerDetails(0), expected);
    });
    it('should return details of 2 players', function() {
      game.addPlayer("Madhuri", 1, 1);
      game.addPlayer("Neeraj", 2, 2);
      let expected = {
        1: {
          name: "Madhuri",
          inRoom: false,
          character: {
            name: "Miss Scarlett",
            color: "#bf0000",
            turn: 1,
            position: 69
          }
        },
        2: {
          name: "Neeraj",
          cards: [],
          inRoom: false,
          character: {
            "color": "#ffff00",
            "name": "Col Mustard",
            turn: 2,
            position: 56
          }
        }
      };
      assert.deepEqual(game.getAllPlayerDetails(2), expected);
    });
  });

  describe("#getCurrentPlayer", () => {
    it("should return id of player according to turn", () => {
      game.addPlayer("Suyog", 1, 1);
      game.addPlayer("Bhanu", 2, 2);
      game.addPlayer("Omkar", 3, 3);
      game.start();
      assert.deepEqual(game.getCurrentPlayer(), {
        name: 'Suyog',
        inRoom: false,
        character: {
          "color": "#bf0000",
          "name": "Miss Scarlett",
          'turn': 1,
          position: 69
        }
      });
    });
  });

  describe('#getPlayersPosition', function() {
    it('should return all player\'s positions', function() {
      game._unAssignedChars.splice(0, 1);
      game.addPlayer("Pranav", 1, 1);
      game._unAssignedChars.splice(0, 1);
      game.addPlayer("Patel", 2, 2);
      game.start();
      let actualOutput = game.getPlayersPosition();
      let expected = [{
          name: "Miss Scarlett",
          position: 69
        },
        {
          "name": "Col Mustard",
          position: 56
        },
        {
          "inactive": true,
          "name": "Dr Orchid",
          "position": 49
        },
        {
          "inactive": true,
          "name": "Rev Green",
          "position": 79
        },
        {
          "inactive": true,
          "name": "Mrs Peacock",
          "position": 5
        },
        {
          "inactive": true,
          "name": "Prof Plum",
          "position": 13
        }
      ];
      assert.deepEqual(actualOutput, expected);
    });
  });

  describe('#hasGameStarted', function() {
    it('should return true when game has started', function() {
      assert.isNotOk(game.hasStarted());
      game.addPlayer('Patel', 205, 1);
      game.start();
      assert.isOk(game.hasStarted());
    });
  });

  describe('#selectMurderCombination', function() {
    it('should select murder combination', function() {
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
      game.addPlayer('Patel', 1, 1);
      game.start();
      for (let index = 0; index < 10; index++) {
        let val = game.rollDice();
        assert.isAbove(val, 0);
        assert.isBelow(val, 7);
      }
    });
  });

  describe('#collectRemainingCards', function() {
    it('should collect remaining cards', function() {
      let rooms = game.cardHandler.rooms;
      let weapons = game.cardHandler.weapons;
      let characters = game.cardHandler.characters;
      let allCards = [...rooms, ...weapons, ...characters];
      game.gatherRemainingCards();
      assert.deepEqual(allCards, game.cardHandler._remainingCards);
      assert.deepEqual(game.cardHandler.rooms, []);
      assert.deepEqual(game.cardHandler.weapons, []);
      assert.deepEqual(game.cardHandler.characters, []);
    });
  });

  describe('#getRandomCard', function() {
    it('should return random card from remaining card', function() {
      let rooms = game.cardHandler.rooms;
      let weapons = game.cardHandler.weapons;
      let characters = game.cardHandler.characters;
      let allCards = [...rooms, ...weapons, ...characters];
      game.gatherRemainingCards();
      let randomCard = game.getRandomCard(allCards);
      assert.notDeepInclude(randomCard, allCards);
    });
  });

  describe('#hasRemainingCard', function() {
    it('should check wheather it has any remaining card', function() {
      assert.isNotOk(game.hasRemainingCard());
      game.gatherRemainingCards();
      assert.isOk(game.hasRemainingCard());
    });
  });

  describe('#distributeCards', function() {
    it('should distribute cards among all players', function() {
      game.addPlayer('Patel', 1, 1);
      game.addPlayer('Pranav', 2, 2);
      assert.isNotOk(game.hasRemainingCard());
      game.gatherRemainingCards();
      assert.isOk(game.hasRemainingCard());
      game.distributeCards();
      assert.isNotOk(game.hasRemainingCard());
    });
  });

  describe('#isCurrentPlayer', () => {
    beforeEach(()=>{
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Pranav", 2, 2);
      game.start();
    });
    it('should return true for first player', () => {
      assert.isOk(game.isCurrentPlayer(1));
    });
    it('should return false for other player', () => {
      assert.isFalse(game.isCurrentPlayer(2));
    });
  });

  describe('#validateMove', () => {
    beforeEach(()=>{
      game.addPlayer("Pranav", 1, 1);
      game.start();
    })
    it('should return true for valid forward move', () => {
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
      game.diceVal = 2;
      assert.isOk(game.validateMove(67));
      game.diceVal = 3;
      game.players[1].updatePos(4);
      assert.isOk(game.validateMove(1));
    });
    it('should return false for invalid forward move', () => {
      game.diceVal = 1;
      assert.isNotOk(game.validateMove(4));
      game.diceVal = 2;
      assert.isNotOk(game.validateMove(6));
      game.diceVal = 5;
      assert.isNotOk(game.validateMove(1));
    });
    it('should return false for invalid backward move', () => {
      game.diceVal = 2;
      assert.isNotOk(game.validateMove(76));
      game.diceVal = 5;
      assert.isNotOk(game.validateMove(62));
    });
    it('should return false for moving to same room', () => {
      game.diceVal = 1;
      game.players[1].updatePos('Hall');
      assert.isNotOk(game.validateMove('Hall'));
      assert.isOk(game.validateMove('53'));
    });
    it('should return false for moving to invalid room', () => {
      game.diceVal = 1;
      game.players[1].updatePos('Hall');
      assert.isNotOk(game.validateMove('Lounge'));
    });
    it('should return true if player selected valid connected room from room', () => {
      game.diceVal = 2;
      game.players[1].updatePos('Lounge');
      assert.isOk(game.validateMove('Conservatory'));
      game.players[1].updatePos('Conservatory');
      assert.isOk(game.validateMove('Lounge'));
      game.players[1].updatePos('Kitchen');
      assert.isOk(game.validateMove('Study'));
      game.players[1].updatePos('Study');
      assert.isOk(game.validateMove('Kitchen'));
    });
    it('should return false if selected position is same as current position', () => {
      game.diceVal = 2;
      game.players[1].updatePos('Lounge');
      assert.isNotOk(game.validateMove('Lounge'));
    });
  });

  describe('#getPlayerdata', function() {
    it('should return player data of given id', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Madhuri", 2, 2);
      game.addPlayer("patel", 3, 3);
      game.setMurderCombination();
      game.gatherRemainingCards();
      game.distributeCards();
      let pranavCards = game.getPlayerData(1).cards;
      assert.equal(pranavCards.length, 6);
      assert.deepEqual(Object.keys(pranavCards[1]), ['name', 'type']);
    });
  });

  describe('#updatePlayerPos', () => {
    beforeEach(function () {
      game.addPlayer("Pranav", 1, 1);
      game.start();
    })
    it('should update player\'s position', () => {
      game.diceVal = 2;
      assert.isOk(game.updatePlayerPos(75));
      let player = game.players[1];
      let characterPos = player.character.position;
      assert.equal(characterPos, 75);
      assert.isFalse(player.character.start);
    });
    it('should return false if already moved', () => {
      game.diceVal = 2;
      game.updatePlayerPos(2);
      assert.isFalse(game.updatePlayerPos(3));
    });
  });

  describe('#isSuspecting', () => {
    it('should give true if player is suspecting',()=>{
      let characterId=game.getRandomCharacterId();
      game.addPlayer("Pranav", 1,characterId);
      game.start();
      let combination = {
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      };
      game.updateSuspicionOf(1,combination);
      assert.ok(game.isSuspecting());
    });
    it('should give false if player is not suspecting', () => {
      game.addPlayer("Pranav", 1, 1);
      assert.isNotOk(game.isSuspecting());
    });
  });

  describe('#getCurrentSuspicion', () => {
    it('should give suspicion combination', () => {
      game.addPlayer("Pranav", 1, 1);
      game.start();
      let combination = {
        character: 'Dr. Orchid',
        weapon: 'Revolver',
        room: "Hall"
      };

      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Hall", 'Room');
      let combinationO = new Combination(room, weapon, character);
      game.updateSuspicionOf(1, combinationO);
      assert.deepEqual(game.getCombination(), combination);
    });
    it('should give empty object if combination is not defined', () => {
      game.addPlayer("Pranav", 1, 1);
      assert.deepEqual(game.getCombination(), {});
    });
  });

  describe('#getSuspicion', () => {
    it('should give suspicion combination with canceller name', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("ketan", 2, 2);
      game.start();
      game.players['2'].addCard(new Card("Hall", 'Room'));
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Hall", 'Room');
      let combinationO = new Combination(room, weapon, character);
      game.updateSuspicionOf(1, combinationO);
      game.ruleOut('Hall');
      let suspicion = {
        "canBeCancelled": true,
        "cancelled": true,
        "cancelledBy": "ketan",
        "combination": {
          "_character": {
            "_name": "Dr. Orchid",
            "_type": "Character"
          },
          "_room": {
            "_name": "Hall",
            "_type": "Room"
          },
          "_weapon": {
            "_name": "Revolver",
            "_type": "Weapon"
          },
        },
        "currentPlayer": "Pranav",
        "ruleOutCard": "Hall",
        "ruleOutCardType": "Room",
        "suspector": "Pranav"
      };
      assert.deepEqual(game.getSuspicion(1), suspicion);
    });
  });

  describe('#addActivity', function() {
    it('should add activity to the activityLog', function() {
      let activityTime = game.addActivity('activity 1');
      let activities = game._activityLog.activities;
      assert.deepEqual(activities[0],{ time: 1, activity: 'activity 1', color: '' });
    });
  });

  describe('#getActivitiesAfter', function() {
    it('should return all activities after given time', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addActivity('activity 1');
      game.addActivity('activity 2');
      game.addActivity('activity 3');
      let expected = [
        {time:2,activity:'activity 2', color: ''},
        {time:3,activity:'activity 3', color: ''}
      ];
      assert.deepEqual(game.getActivitiesAfter(1, 1), expected)
    });
  });

  describe('#start', function() {
    it('should start the game', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      assert.isNotOk(game.hasStarted());
      game.start();
      assert.isOk(game.hasStarted());
      let activities = game.getActivitiesAfter(0, 1)
      let expectedActivities = [{
        time:1,
        color: '',
        activity:'Game has started'
      }];
      assert.deepEqual(expectedActivities, activities);
    });
  });

  describe('#getNextPlayerTurn', function() {
    it('should give the next player', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      assert.isNotOk(game.hasStarted());
      game.start();
      assert.isOk(game.hasStarted());
      game._turn = 1;
      assert.equal(game.getNextPlayerTurn(), 2);
      game._turn = 2;
      assert.equal(game.getNextPlayerTurn(), 3);
      game._turn = 3;
      assert.equal(game.getNextPlayerTurn(), 1);
    });

    it('should give 0 if all players are deactivated', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      game.start();
      game.players[1].deactivate();
      game.players[2].deactivate();
      game.players[3].deactivate();
      game._activePlayers=[];
      assert.equal(game.getNextPlayerTurn(), 0);
    });

    it('should return next turn, of the deactivated player in previous turn',()=>{
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 5);
      game.addPlayer("Patel", 3, 3);
      game.start();
      game._lastInactivePlayer = 1;
      assert.equal(game.getNextPlayerTurn(),5);
      assert.equal(game._lastInactivePlayer,-1)
      game._lastInactivePlayer = 1;
      assert.equal(game.getNextPlayerTurn(),1);
      assert.equal(game._lastInactivePlayer,-1)
    });
  });

  describe('#getPlayerId', function() {
    it('should give id of a player', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      assert.equal(game.getPlayerId(1), 1);
      assert.equal(game.getPlayerId(2), 2);
      assert.equal(game.getPlayerId(3), 3);
    });
  });

  describe('#canRuleOut', () => {
    it('should return false if player can not rule out', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination, 'Patel');
      currentSuspicion.canceller = 1;
      currentSuspicion.cancellingCards = [weapon];
      game._currentSuspicion = currentSuspicion;
      assert.isNotOk(game.canRuleOut(1, 'Hall'));
    });

    it('should return true if player can rule out', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination, 'Patel');
      currentSuspicion.canceller = 1;
      currentSuspicion.cancellingCards = [room];
      game._currentSuspicion = currentSuspicion;
      assert.isOk(game.canRuleOut(1, 'Lounge'));
    });
  });

  describe('#ruleOut', () => {
    it('should set cancelled as true and ruleOutCard as given card', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      game.start();
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination, 'Patel');
      game._currentSuspicion = currentSuspicion;
      let player = game.getPlayer(1);
      game.players['2'].addCard(room);
      game.findCanceller(player);
      game.ruleOut('Lounge');
      assert.isOk(currentSuspicion.cancelled);
      assert.deepEqual(currentSuspicion.ruleOutCard.name, 'Lounge');
    });
  });

  describe('#findCanceller', () => {
    it('should set canceller in suspicion', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination, 'Patel');
      game._currentSuspicion = currentSuspicion;
      let start = 1;
      let player = new Player('Patel', {
        "name": "Col. Mustard",
        "color": "#ffdb58",
        "position": 11,
        "start": true,
        "turn": 2
      }, () => start++);
      game.players['1'].addCard(weapon);
      game.findCanceller(player);
      assert.isOk(currentSuspicion.canBeCancelled);
      assert.equal(currentSuspicion.cancellerName, 'Pranav');
      assert.equal(currentSuspicion.canceller, 1);
      assert.deepEqual(currentSuspicion.cancellingCards, [weapon]);
    });

    it('should set canceller in suspicion', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentSuspicion = new Suspicion(combination, 'Patel');
      game._currentSuspicion = currentSuspicion;
      let start = 1;
      let player = new Player('Patel', {
        "name": "Col. Mustard",
        "color": "#ffdb58",
        "position": 11,
        "start": true,
        "turn": 2
      }, () => start++);
      game.findCanceller(player);
      assert.isNotOk(currentSuspicion.canBeCancelled);
      assert.deepEqual(currentSuspicion.cancellingCards, []);
    });
  });

  describe('#accuse', () => {
    it('should raise an accusation and should move suspected player to the room which is suspected', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      game.start();
      game.players[1].updatePos('Lounge');
      let character = new Card('Dr Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      game._murderCombination = new Combination(room, weapon, character);
      let combination = new Combination(room, weapon, character);
      assert.isOk(game.accuse(combination));
      assert.equal(game.players[3].character.position, 'Lounge');
      assert.equal(game.players[1].character.position, game.players[3].character.position);
    });
  });

  describe('#getAccuseCombination', () => {
    it('should return an accuse combination which has been raised', () => {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("AJ", 3, 3);
      game.start();
      let character = new Card('Dr Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      game._murderCombination = new Combination(room, weapon, character);
      let combination = new Combination(room, weapon, character);
      assert.isOk(game.accuse(combination));
      let expected = {
        character: 'Dr Orchid',
        room: 'Lounge',
        weapon: 'Revolver',
      };
      assert.deepEqual(game.getAccuseCombination(), expected);
    });
  });

  describe('#isCorrectAccusation', () => {
    it('should return false if given combination is not same as murder combination', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.start();
      let character = new Card('Dr Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentAccusation = new Suspicion(combination, 'Patel');
      game._currentAccusation = currentAccusation;
      room = new Card("Hall", 'Room');
      combination = new Combination(room, weapon, character);
      game._murderCombination = combination;
      assert.isNotOk(game.isCorrectAccusation());
    });

    it('should return true if given combination is same as murder combination', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      let character = new Card('Dr Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentAccusation = new Suspicion(combination, 'Patel');
      game._currentAccusation = currentAccusation;
      game._murderCombination = combination;
      assert.isOk(game.isCorrectAccusation());
    });
  });

  describe('#getAccusationState', function() {
    it('should return false if current accusation is empty', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      assert.isNotOk(game.getAccusationState());
    });

    it('should return opposite of state if current accusation is not empty', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      let character = new Card('Dr Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      let currentAccusation = new Suspicion(combination, 'Patel');
      game._currentAccusation = currentAccusation;
      game._murderCombination = combination;
      assert.isNotOk(game.getAccusationState());
      room = new Card("Hall", 'Room');
      combination = new Combination(room, weapon, character);
      game._murderCombination = combination;
      assert.isOk(game.getAccusationState());
    });
  });

  describe('#getActivePlayers', function() {
    it('should return active players', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      let players = [game.players[1], game.players[2]];
      assert.deepEqual(players, game.getActivePlayers());
      game.players[1].deactivate();
      players = [game.players[2]];
      assert.deepEqual(players, game.getActivePlayers());
    });
  });

  describe('#pass', function() {
    it('should return true if turn is passed', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.start();
      game.rollDice();
      assert.isOk(game.pass());
    });

    it('should not pass turn if player hasn\'t done any action', () => {
      game.addPlayer('Patel', 1, 1);
      game.start();
      assert.isUndefined(game.pass());
    });
  });

  describe('#murderCombination', function() {
    it('should return murder combination', function() {
      let character = new Card('Dr Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      game._murderCombination = new Combination(room, weapon, character);
      assert.deepEqual(game.murderCombination, {
        "character": "Dr Orchid",
        "room": "Lounge",
        "weapon": "Revolver"
      });
    });
  });

  describe('#movePlayerToken', function() {
    it('should change assigned or unassigned characters position to given position', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("Pooja", 3, 3);
      game.start();
      let character = new Card('Dr Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Lounge", 'Room');
      let combination = new Combination(room, weapon, character);
      game.players[1].updatePos('Lounge');
      game.movePlayerToken(combination);
      assert.equal(game.players[3].character.position, 'Lounge');
      character = new Card('Prof Plum', 'Character');
      combination = new Combination(room, weapon, character);
      game.movePlayerToken(combination);
      assert.deepInclude(game._unAssignedChars, {
        name: "Prof Plum",
        position: 'Lounge',
        inactive: false
      });
    });
  });

  describe('#getSecretPassage', function() {
    it('should return name of secret passage if the player position is room and it has', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("Pooja", 3, 3);
      game.start();
      game.players[1].updatePos('Lounge');
      game.players[1].inRoom = true;
      assert.equal(game.getSecretPassage(), 'Conservatory');
    });

    it('should return "" if the player position is room and it does not have secret passage', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("Pooja", 3, 3);
      game.start();
      game.players[1].updatePos('Hall');
      game.players[1].inRoom = true;
      assert.equal(game.getSecretPassage(), '');
    });

    it('should return "" if the player position is not room', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("Pooja", 3, 3);
      game.start();
      assert.equal(game.getSecretPassage(), '');
    });
  });

  describe('#state', function() {
    it('should return current state of game', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("Pooja", 3, 3);
      game.start();
      assert.equal(game.state, 'running');
      let murderCombination = game.murderCombination;
      let character = new Card(murderCombination.character, 'Character');
      let weapon = new Card(murderCombination.weapon, 'Weapon');
      let room = new Card(murderCombination.room, 'Room');
      let combination = new Combination(room, weapon, character);
      game.accuse(combination);
      assert.equal(game.state, 'win');
      game.players[1].deactivate();
      game.players[2].deactivate();
      game.players[3].deactivate();
      assert.equal(game.state, 'draw');
    });
  });

  describe('#getPlayersStatus', function() {
    it('should return status of every active player', function() {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.addPlayer("Pooja", 3, 3);
      game.start();
      let expectedOutput = {
        1: true,
        2: true,
        3: true
      };
      assert.deepEqual(game.getPlayersStatus(), expectedOutput);
      game.players[1].deactivate();
      expectedOutput = {
        1: false,
        2: true,
        3: true
      };
      assert.deepEqual(game.getPlayersStatus(), expectedOutput);
    });
  });

  describe('#canPass', function() {
    it('should return false if player can\'t pass his turn', () => {
      game.addPlayer("Pranav", 1, 1);
      game.start();
      assert.isNotOk(game.canPass());
    })
    it('should return true if player can pass his turn', () => {
      game.addPlayer("Pranav", 1, 1);
      game.start();
      game.rollDice();
      assert.isOk(game.canPass());
    })
  })

  describe('#shutPlayerDown', function() {
    it('should return if valid player is give', () => {
      game.addPlayer("Pranav", 1, 1);
      game.start();
      assert.isOk(game.shutPlayerDown(1));
    })
    it('current turn should get change if current player leaves the game',function () {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Patel", 2, 2);
      game.start();
      game.shutPlayerDown(1);
      assert.equal(game._turn,2);
    })
  })

  describe('#_hasLeft', function () {
    it('game should cancel suspicion on behalf of player if player has left the game',function () {
      game.addPlayer("Pranav", 1, 1);
      game.addPlayer("Ketan", 2, 2);
      game.addPlayer("Patel", 3, 3);
      game.players[2].addCard(new Card("Hall", 'Room'));
      game.start();
      game.shutPlayerDown(2);
      game.shutPlayerDown(3);
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Hall", 'Room');
      let combinationO = new Combination(room, weapon, character);
      game.updateSuspicionOf(1, combinationO);
      assert.isOk(game._currentSuspicion.cancelled);
      assert.deepInclude(game._currentSuspicion.cancellingCards,room);
    })
  })
});
