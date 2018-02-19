const chai = require('chai');
const assert = chai.assert;
const Card = require('../../src/models/card.js');
const Combination = require('../../src/models/combination.js');

describe('Combination', function(){

  describe('#room', function(){
    it('should return a room card',function() {
      let hallCard = new Card('Hall','Room');
      let candlestickCard = new Card('Candlestick','Weapon');
      let patelCard = new Card('Patel','Character');
      let combination = new Combination(hallCard,candlestickCard,patelCard);
      assert.deepEqual(combination.room,hallCard);
    });
  });
  describe('#weapon', function(){
    it('should return a weapon card',function() {
      let hallCard = new Card('Hall','Room');
      let candlestickCard = new Card('Candlestick','Weapon');
      let patelCard = new Card('Patel','Character');
      let combination = new Combination(hallCard,candlestickCard,patelCard);
      assert.deepEqual(combination.weapon,candlestickCard);
    });
  });
  describe('#character', function(){
    it('should return a character card',function() {
      let hallCard = new Card('Hall','Room');
      let candlestickCard = new Card('Candlestick','Weapon');
      let patelCard = new Card('Patel','Character');
      let combination = new Combination(hallCard,candlestickCard,patelCard);
      assert.deepEqual(combination.character,patelCard);
    });
  });
  describe('#isEqualTo', function(){
    it('should check if the cards are same', function(){
      let hallCard = new Card('Hall','Room');
      let candlestickCard = new Card('Candlestick','Weapon');
      let ropeCard = new Card('Rope','Weapon');
      let patelCard = new Card('Patel','Character');
      let madhuriCard = new Card('Madhuri','Character');
      let combination = new Combination(hallCard,candlestickCard,patelCard);
      let combination2 = new Combination(hallCard,candlestickCard,patelCard);
      assert.isOk(combination.isEqualTo(combination2));
      let badCombination = new Combination(hallCard,ropeCard,madhuriCard);
      assert.isNotOk(combination.isEqualTo(badCombination));
    });
  });

  describe('#contains', function(){
    it('should check whether combination contains the card', function(){
      let hallCard = new Card('Hall','Room');
      let ropeCard = new Card('Rope','Weapon');
      let patelCard = new Card('Patel','Character');
      let combination = new Combination(hallCard,ropeCard,patelCard);
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
