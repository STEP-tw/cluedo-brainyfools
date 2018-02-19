const chai = require('chai');
const assert = chai.assert;
const Game = require('../../src/models/game.js');

describe('Game',()=>{
  let game;
  beforeEach(()=>{
    game = new Game(3);
  });


  describe('#addPlayer',()=>{
    it('should create new player with diff. characters',()=>{
      game.addPlayer("suyog",1);
      game.addPlayer("omkar",2);
      let actualOutput = game.players[1];
      let expectedOutput = {
        _name:'suyog',
        _character:{
          "_name":"Miss Scarlett",
          "_tokenColor":"#bf0000",
          "_position":1,
          "_turn":1,
          "_start" : true
        }
      };
      assert.deepEqual(actualOutput,expectedOutput);
    });
  });


  describe('#getPlayer',()=>{
    it('should return player by his/her id',()=>{
      game.addPlayer("suyog",1);
      game.addPlayer("omkar",2);
      let player = game.getPlayer(1);
      assert.equal(player.name,'suyog');
    });
  });


  describe('#getPlayerCount',()=>{
    it('should return count of players joined',()=>{
      game.addPlayer("suyog",1);
      game.addPlayer("omkar",2);
      let playerCount = game.getPlayerCount();
      assert.equal(playerCount,2);
    });
  });


  describe('#haveAllPlayersJoined', function(){
    it('should return true when game is ready to start', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("JD",3);
      assert.isOk(game.haveAllPlayersJoined());
    });

    it('should return false when isnt ready to start', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      assert.isNotOk(game.haveAllPlayersJoined());
    });
  });

  describe('#getAllPlayerDetails', function () {
    it('should return details of 1 players', function () {
      game.addPlayer("Madhuri", 1);
      let expected = {
        1: {
          name: "Madhuri",
          character: {
            name: "Miss Scarlett",
            color: "#bf0000"
          }
        }
      };
      assert.deepEqual(game.getAllPlayerDetails(), expected);
    });
    it('should return empty for no players', function () {
      let expected = {
      };
      assert.deepEqual(game.getAllPlayerDetails(), expected);
    });
    it('should return details of 2 players', function () {
      game.addPlayer("Madhuri", 1);
      game.addPlayer("Neeraj", 23);
      let expected = {
        1: {
          name: "Madhuri",
          character: {
            name: "Miss Scarlett",
            color: "#bf0000"
          }
        },
        23: {
          name: "Neeraj",
          character: {
            "color": "#ffdb58",
            "name": "Col. Mustard"
          }
        }
      };
      assert.deepEqual(game.getAllPlayerDetails(), expected);
    });
  });
  describe('#getPlayersPosition', function(){
    it('should return all player\'s positions', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      let actualOutput = game.getPlayersPosition();
      let expected = [
        {
          name: "Miss Scarlett",
          position:1,
          start:true
        },
        {
          "name": "Col. Mustard",
          position:11,
          start:true
        }
      ];
      assert.deepEqual(actualOutput,expected);
    });
  });

  describe('#hasGameStarted', function(){
    it('should return true when game has started', function(){
      assert.isNotOk(game.hasStarted());
      game.start();
      assert.isOk(game.hasStarted());
    });
  });

  describe('#selectMurderCombination', function(){
    it('should select murder combination', function(){
      let roomCards = game.cardHandler.rooms;
      let weaponCards = game.cardHandler.weapons;
      let characterCards = game.cardHandler.characters;
      game.setMurderCombination();

      let murderCombination = game.getMurderCombination();

      assert.notDeepInclude(roomCards,murderCombination.room);
      assert.notDeepInclude(weaponCards,murderCombination.weapon);
      assert.notDeepInclude(characterCards,murderCombination.character);
    });
  });

});
