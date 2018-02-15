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
          "name":"Miss Scarlett",
          "color":"red",
          "position":1
        }
      };
      assert.deepEqual(actualOutput,expectedOutput);
    });
  });
});
