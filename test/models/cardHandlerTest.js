const chai = require('chai');
const assert = chai.assert;
const CardHandler = require('../../src/models/cardHandler.js');
const Card = require('../../src/models/card.js');

describe('CardHandler', function(){

  describe('#createCharacterCard', function(){
    it('should generate a character card', function(){
      let cardHandler = new CardHandler();
      let orchidCard = new Card('Orchid','Character');
      cardHandler.createCharacterCard('Orchid');
      assert.deepInclude(cardHandler.characters,orchidCard);
    });

  });
  describe('#createRoomCard', function(){
    it('should create a room card', function(){
      let cardHandler = new CardHandler();
      let hallCard = new Card('Hall','Room');
      cardHandler.createRoomCard('Hall');
      assert.deepInclude(cardHandler.rooms,hallCard);
    });
  });
  describe('#createWeaponCard', function(){
    it('should create a weapon card', function(){
      let cardHandler = new CardHandler();
      let daggerCard = new Card('Dagger','Weapon');
      cardHandler.createWeaponCard('Dagger');
      assert.deepInclude(cardHandler.weapons,daggerCard);
    });
  });

  describe('#generateCards', function(){
    it('should create all cards', function(){
      let cardHandler = new CardHandler();
      let orchidCard = new Card('Dr Orchid','Character');
      let hallCard = new Card('Hall','Room');
      let daggerCard = new Card('Dagger','Weapon');
      assert.deepInclude(cardHandler.characters,orchidCard);
      assert.deepInclude(cardHandler.weapons,daggerCard);
      assert.deepInclude(cardHandler.rooms,hallCard);
    });
  });
  describe('#getRandomCard', function(){
    it('should return random card of given type', function(){
      let cardHandler = new CardHandler();
      let characterCards = cardHandler.characters;
      let randomCard = cardHandler.getRandomCard(characterCards);
      assert.notDeepInclude(characterCards,randomCard);
      let anotherRandomCard = cardHandler.getRandomCard(characterCards);
      assert.notDeepInclude(characterCards,anotherRandomCard);
      assert.notDeepEqual(randomCard,anotherRandomCard);
    });
  });
  describe('#getRandomCombination', function(){
    it('should return random combination', function(){
      let cardHandler = new CardHandler();
      let roomCards = cardHandler.rooms;
      let weaponCards = cardHandler.weapons;
      let characterCards = cardHandler.characters;
      let randomCombination = cardHandler.getRandomCombination();

      assert.notDeepInclude(roomCards,randomCombination.room);
      assert.notDeepInclude(weaponCards,randomCombination.weapon);
      assert.notDeepInclude(characterCards,randomCombination.character);
    });
  });
  describe('#gatherRemainingCards', function(){
    it('should collect remaining cards', function(){
      let cardHandler = new CardHandler();
      let rooms = cardHandler.rooms;
      let weapons = cardHandler.weapons;
      let characters = cardHandler.characters;
      let allCards = [...rooms,...weapons,...characters];
      cardHandler.gatherRemainingCards();
      assert.deepEqual(allCards,cardHandler._remainingCards);
      assert.deepEqual(cardHandler.rooms,[]);
      assert.deepEqual(cardHandler.weapons,[]);
      assert.deepEqual(cardHandler.characters,[]);
    });
  });
  describe('#hasRemainingCard', function(){
    it('should check wheather it has any remaining card', function(){
      let cardHandler = new CardHandler();
      assert.isNotOk(cardHandler.hasRemainingCard());
      cardHandler.gatherRemainingCards();
      assert.isOk(cardHandler.hasRemainingCard());
    });
  });
});
