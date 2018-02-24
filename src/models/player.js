let Suspicion = require('./suspicion.js');
class Player {
  constructor(name,character) {
    this._name = name;
    this._character = character;
    this._cards = [];
    this._lastSuspicion=new Suspicion({},this._name);
    this._inRoom = false;
  }
  get name(){
    return this._name;
  }
  get inRoom(){
    return this._inRoom;
  }
  set inRoom(val){
    this._inRoom = val;
  }
  get character(){
    return this._character;
  }
  addCard(card){
    this._cards.push(card);
  }
  updatePos(pos){
    this.character.position = pos;
    this.character.start = false;
    this.updateSuspicion({});
    return true;
  }
  updateSuspicion(combination) {
    let suspicion = new Suspicion(combination,this._name);
    this._lastSuspicion = suspicion;
    return true;
  }
  canSuspect(room) {
    return this._lastSuspicion.combination.room!=room;
  }
  isSuspecting() {
    return Object.keys(this._lastSuspicion['combination']).length!=0;
  }
  getSuspicion() {
    return this._lastSuspicion;
  }
  getCombination(){
    if(!this._lastSuspicion.combination.room){
      return {};
    }
    let combination = {
      room: this._lastSuspicion.combination.room.name,
      weapon: this._lastSuspicion.combination.weapon.name,
      character: this._lastSuspicion.combination.character.name
    };
    return combination;
  }
  canCancel(suspicion){
    return this._cards.some(card=>suspicion.combination.contains(card));
  }
  getCancellingCards(suspicion){
    return this._cards.filter(card=>suspicion.combination.contains(card));
  }
}

module.exports = Player;
