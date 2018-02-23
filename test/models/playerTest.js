const chai = require('chai');
const assert = chai.assert;
const Card = require('../../src/models/card.js');
const Player = require('../../src/models/player.js');
const Suspicion = require('../../src/models/suspicion.js');

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
      }
      player._lastSuspicion = new Suspicion(combination,'suyog');
      assert.isNotOk(player.canSuspect('Hall'));
    });
  });
  describe('#canSuspect',()=>{
    it('should give true if player can suspect',()=>{
      assert.isOk(player.canSuspect('Hall'));
    });
    it('should give false if player can\'t suspect',()=>{
      let expected = {'_combination':{
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      },'_suspector':'suyog'};
      assert.ok(player.updateSuspicion(expected._combination));
      assert.deepEqual(player._lastSuspicion,expected);
    });
  });
  describe('#isSuspecting',()=>{
    it('should give true if player is suspecting',()=>{
      let combination = {
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      };
      player.updateSuspicion(combination);
      assert.ok(player.isSuspecting());
    });
    it('should give false if player is not suspecting',()=>{
      assert.isNotOk(player.isSuspecting());
    });
  });
  describe('#getCombination',()=>{
    it('should give suspicion combination',()=>{
      let combination = {
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      };
      player.updateSuspicion(combination);
      assert.deepEqual(player.getCombination(),combination);
    });
    it('should give empty object if combination is not defined',()=>{
      assert.deepEqual(player.getCombination(),{});
    });
  });
});
