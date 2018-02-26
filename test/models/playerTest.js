const chai = require('chai');
const assert = chai.assert;
const Card = require('../../src/models/card.js');
const Player = require('../../src/models/player.js');
const Suspicion = require('../../src/models/suspicion.js');
const Combination = require('../../src/models/combination');

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
  describe('#canSuspect',()=>{
    it('should give true if player can suspect',()=>{
      assert.isOk(player.canSuspect('Hall'));
    });
    it('should give false if player can\'t suspect',()=>{
      let combination = {
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      };
      player.updatePos('Hall');
      player._lastSuspicion = new Suspicion(combination,'suyog');
      assert.isNotOk(player.canSuspect('Hall'));
    });
  });
});
