const chai = require('chai');
const assert = chai.assert;
const Card = require('../../src/models/card.js');

describe('Card', function(){
  describe('#name', function(){
    it('should return name of the card',function() {
      let card = new Card('Patel','Character');
      assert.equal(card.name,'Patel');
    });
  });
  describe('#type', function(){
    it('should return type of the card', function(){
      let card = new Card('Patel','Character');
      assert.equal(card.type,'Character');
    });
  });
  describe('#isSame', function(){
    it('should check if the cards are same', function(){
      let card = new Card('Patel','Character');
      let dummyCard = {name:'Patel',type:'Character'};
      assert.isOk(card.isSame(dummyCard));
    });
  });
});
