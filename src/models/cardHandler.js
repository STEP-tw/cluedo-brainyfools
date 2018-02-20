const Card = require('./card.js');
const cardsData = require('./cardsData.js');
const Combination = require('./combination.js');

class CardHandler {
  constructor() {
    this._rooms = [];
    this._characters = [];
    this._weapons = [];
    this._remainingCards = [];
    this.generateCards();
  }
  get rooms() {
    return this._rooms;
  }
  get characters(){
    return this._characters;
  }
  get weapons(){
    return this._weapons;
  }
  generateCards(){
    let characterCards = cardsData['Characters'];
    characterCards.forEach((cardName)=>{
      this.createCharacterCard(cardName);
    });
    let roomCards = cardsData['Rooms'];
    roomCards.forEach((cardName)=>{
      this.createRoomCard(cardName);
    });
    let weaponCards = cardsData['Weapons'];
    weaponCards.forEach((cardName)=>{
      this.createWeaponCard(cardName);
    });
  }
  createCharacterCard(cardName) {
    let characterCard = new Card(cardName,'Character');
    this.characters.push(characterCard);
  }
  createRoomCard(cardName){
    let roomCard = new Card(cardName,'Room');
    this.rooms.push(roomCard);
  }
  createWeaponCard(cardName){
    let weaponCard = new Card(cardName,'Weapon');
    this.weapons.push(weaponCard);
  }
  getRandomCombination(){
    let roomCard = this.getRandomCard(this.rooms);
    let weaponCard = this.getRandomCard(this.weapons);
    let characterCard = this.getRandomCard(this.characters);
    return new Combination(roomCard,weaponCard,characterCard);
  }
  getRandomCard(cards){
    let randomIndex = Math.floor(Math.random()*cards.length);
    return cards.splice(randomIndex,1)[0];
  }
  gatherRemainingCards(){
    this._remainingCards = [...this.rooms,...this.weapons,...this.characters];
    this._rooms = this._weapons = this._characters = [];
  }
  hasRemainingCard(){
    return this._remainingCards.length != 0;
  }
}

module.exports = CardHandler;
