const Card = require('./card.js');

class Combination {
  constructor(roomName,weaponName,characterName) {
    this._room = new Card(roomName,'Room');
    this._weapon = new Card(weaponName,'Weapon');
    this._character = new Card(characterName,'Character');
  }
  get room(){
    return this._room;
  }
  get weapon(){
    return this._weapon;
  }
  get character(){
    return this._character;
  }
  isEqualTo(combination){
    return this.room.isSame(combination.room) &&
    this.weapon.isSame(combination.weapon) &&
    this.character.isSame(combination.character);
  }
  contains(card){
    return this.room.isSame(card) ||
    this.weapon.isSame(card) ||
    this.character.isSame(card);
  }
}

module.exports = Combination;
