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
          "_tokenColor":"red",
          "_position":1,
          "_turn":1
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


  describe('#haveAllPlayersJoined', function(){
    it('should return true when all players required to start a game are joined', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      game.addPlayer("JD",3);
      assert.isOk(game.haveAllPlayersJoined());
    });

    it('should return false when all players required to start a game are not joined', function(){
      game.addPlayer("Pranav",1);
      game.addPlayer("Patel",2);
      assert.isNotOk(game.haveAllPlayersJoined());
    });
  });

});
