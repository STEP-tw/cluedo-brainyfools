const chai = require('chai');
const assert = chai.assert;
const Card = require('../../src/models/card.js');
const Player = require('../../src/models/player.js');
const Suspicion = require('../../src/models/suspicion.js');
const Combination = require('../../src/models/combination');

describe('Player',()=>{
  let player;
  let start = 1;
  beforeEach(()=>{
    player = new Player('suyog',{
      "name":"Col. Mustard",
      "color":"#ffdb58",
      "position":1,
      "start":true,
      "turn" : 2
    },()=>start++);
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
      let roomCard = new Card('Hall', 'Room');
      let charCard = new Card('Miss. Scarlet', 'Character');
      let weaponCard = new Card('Dagger', 'Weapon');
      let combination = new Combination(roomCard, weaponCard, charCard);

      let suspicion = new Suspicion(combination, 'Raghu');
      player.updatePos('Hall');
      player._lastSuspicion = new Suspicion(combination,'suyog');
      assert.isNotOk(player.canSuspect('Hall'));
      player.deactivate();
      assert.isNotOk(player.canSuspect('Hall'));
    });
  });
  describe('#getCancellingCards',()=>{
    it('should return player cards that contains in suspicion combination',()=>{
      let hallCard = new Card('Hall','Room');
      let libraryCard = new Card('library','Room');
      let daggerCard = new Card('Dagger','Weapon');
      player.addCard(hallCard);
      player.addCard(libraryCard);
      player.addCard(daggerCard);

      let roomCard = new Card('Lounge','Room');
      let charCard = new Card('Miss. Scarlet','Character');
      let weaponCard = new Card('Dagger','Weapon');
      let combination = new Combination(roomCard,weaponCard,charCard);

      let suspicion = new Suspicion(combination,'Raghu');
      assert.deepEqual(player.getCancellingCards(suspicion),[daggerCard]);

      roomCard = new Card('Hall','Room');
      charCard = new Card('Miss. Scarlet','Character');
      weaponCard = new Card('Dagger','Weapon');
      combination = new Combination(roomCard,weaponCard,charCard);

      suspicion = new Suspicion(combination,'Raghu');
      assert.deepEqual(player.getCancellingCards(suspicion),[hallCard,daggerCard]);
    });

    it('should not return any cards if no cards contains in suspicion combination',()=>{
      let hallCard = new Card('Hall','Room');
      let libraryCard = new Card('library','Room');
      let daggerCard = new Card('Dagger','Weapon');
      player.addCard(hallCard);
      player.addCard(libraryCard);
      player.addCard(daggerCard);

      let roomCard = new Card('Lounge','Room');
      let charCard = new Card('Miss. Scarlet','Character');
      let weaponCard = new Card('Rope','Weapon');
      let combination = new Combination(roomCard,weaponCard,charCard);

      let suspicion = new Suspicion(combination,'Raghu');
      assert.deepEqual(player.getCancellingCards(suspicion),[]);
    });
  });

  describe('#addActivity',()=>{
    it('should add activity to the player log',()=>{
      player.addActivity('activity 1');
      assert.deepEqual(player.getActivitiesAfter(0),[ { time: 1, activity: 'activity 1', color: ''} ]);
    });
  });

  describe('#shutDown',()=>{
    it('should deactivate player',()=>{
      assert.ok(player.shutDown());
    });
  });

  describe('#Played',()=>{
    it('should set true if nothing is given',()=>{
      player.played();
      assert.isOk(player._played);
    });
    it('should set false if false is given',()=>{
      player.played(false);
      assert.isNotOk(player._played);
    });
  });

  describe('#hasPlayed',()=>{
    it('should give true if player is played',()=>{
      player.played();
      assert.isOk(player.hasPlayed());
    });
    it('should give false if player is not played',()=>{
      assert.isNotOk(player.hasPlayed());
    });
  });

  describe('#canCancel',()=>{
    it('should return false if player can cancel suspicion',()=>{
      let hallCard = new Card('Hall','Room');
      let libraryCard = new Card('library','Room');
      let daggerCard = new Card('Dagger','Weapon');
      player.addCard(hallCard);
      player.addCard(libraryCard);
      player.addCard(daggerCard);

      let roomCard = new Card('Lounge','Room');
      let charCard = new Card('Miss. Scarlet','Character');
      let weaponCard = new Card('Rope','Weapon');
      let combination = new Combination(roomCard,weaponCard,charCard);

      let suspicion = new Suspicion(combination,'Raghu');
      assert.isNotOk(player.canCancel(suspicion));
    });
    it('should return true if player can cancel suspicion',()=>{
      let hallCard = new Card('Hall','Room');
      let libraryCard = new Card('library','Room');
      let daggerCard = new Card('Dagger','Weapon');
      player.addCard(hallCard);
      player.addCard(libraryCard);
      player.addCard(daggerCard);

      let roomCard = new Card('Lounge','Room');
      let charCard = new Card('Miss. Scarlet','Character');
      let weaponCard = new Card('Dagger','Weapon');
      let combination = new Combination(roomCard,weaponCard,charCard);

      let suspicion = new Suspicion(combination,'Raghu');
      assert.isOk(player.canCancel(suspicion));
    });
  });
});
