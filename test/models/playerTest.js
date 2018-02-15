const chai = require('chai');
const assert = chai.assert;
const Player = require('../../src/models/player.js');

describe('Player',()=>{
  let player;
  beforeEach(()=>{
    player = new Player('suyog','green');
  });
  describe('#name',()=>{
    it('should return player\'s name',()=>{
      assert.equal(player.name,'suyog');
    });
  });
  describe('#character',()=>{
    it('should return player\'s character',()=>{
      assert.equal(player.character,'green');
    });
  });
});
