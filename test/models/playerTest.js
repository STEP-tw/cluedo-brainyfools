const chai = require('chai');
const assert = chai.assert;
const Player = require('../../src/models/player.js');

describe('Player',()=>{
  let player;
  beforeEach(()=>{
    player = new Player('suyog',{
      "name":"Col. Mustard",
      "color":"#ffdb58",
      "position":1,
      "start":true,
      "turn" : 2
    });
  });
  describe('#name',()=>{
    it('should return player\'s name',()=>{
      assert.equal(player.name,'suyog');
    });
  });
  describe('#character',()=>{
    it('should return player\'s character',()=>{
      assert.equal(player.character.name,'Col. Mustard');
    });
  });
  describe('#updatePos',()=>{
    it('should update player position',()=>{
      assert.isOk(player.updatePos(5));
      assert.equal(player.character.position,5);
      assert.equal(player.character.start,false);
    });
  });
});
