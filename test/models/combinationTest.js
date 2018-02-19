const chai = require('chai');
const assert = chai.assert;
const Card = require('../../src/models/card.js');
const Combination = require('../../src/models/combination.js');

describe('Combination', function(){

  describe('#room', function(){
    it('should return a room card',function() {
      let combination = new Combination('Hall','Candlestick','Madhuri');
      let hallCard = new Card('Hall','Room');
      assert.deepEqual(combination.room,hallCard);
    });
  });
  describe('#weapon', function(){
    it('should return a weapon card',function() {
      let combination = new Combination('Hall','Candlestick','Madhuri');
      let candlestickCard = new Card('Candlestick','Weapon');
      assert.deepEqual(combination.weapon,candlestickCard);
    });
  });
  describe('#character', function(){
    it('should return a character card',function() {
      let combination = new Combination('Hall','Candlestick','Madhuri');
      let madhuriCard = new Card('Madhuri','Character');
      assert.deepEqual(combination.character,madhuriCard);
    });
  });
  describe('#isEqualTo', function(){
    it('should check if the cards are same', function(){
      let combination = new Combination('Hall','Rope','Patel');
      let dummyCombination = new Combination('Hall','Rope','Patel');
      assert.isOk(combination.isEqualTo(dummyCombination));
      let wrongCombination = new Combination('Hall','Danda','Patel');
      assert.isNotOk(combination.isEqualTo(wrongCombination));
    });
  });
  describe('#contains', function(){
    it('should check whether combination contains the card', function(){
      let combination = new Combination('Hall','Rope','Patel');
      let card = new Card('Hall','Room');
      assert.isOk(combination.contains(card));
      let wrongCard = new Card('Study','Room');
      assert.isNotOk(combination.contains(wrongCard));

      card = new Card('Rope','Weapon');
      assert.isOk(combination.contains(card));
      wrongCard = new Card('Spanner','Weapon');
      assert.isNotOk(combination.contains(wrongCard));

      card = new Card('Patel','Character');
      assert.isOk(combination.contains(card));
      wrongCard = new Card('orchid','Character');
      assert.isNotOk(combination.contains(wrongCard));
    });
  });
});
