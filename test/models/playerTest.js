const chai = require('chai');
const assert = chai.assert;
const Card = require('../../src/models/card.js');
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
  describe('#addCard', function(){
    it('should add card to the given player', function(){
      let characterCard = new Card('Madhuri','Character');
      player.addCard(characterCard);
      assert.deepEqual(player._cards,[characterCard]);
      let weaponCard = new Card('Rope','Weapon');
      player.addCard(weaponCard);
      assert.deepEqual(player._cards,[characterCard,weaponCard]);
    });
  });

});
