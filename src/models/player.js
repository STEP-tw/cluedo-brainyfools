let Suspicion = require('./suspicion.js');
class Player {
  constructor(name,character) {
    this._name = name;
    this._character = character;
    this._cards = [];
    this._lastSuspicion= {};
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
    this._lastSuspicion = {};
    return true;
  }
  isEmpty(suspicion){
    return JSON.stringify(suspicion) == '{}';
  }
  canSuspect(room) {
    if(this.isEmpty(this._lastSuspicion)){
      return true;
    }
    return this._lastSuspicion.combination.room!=room;
  }
  canCancel(suspicion){
    return this._cards.some(card=>suspicion.combination.contains(card));
  }
  getCancellingCards(suspicion){
    return this._cards.filter(card=>suspicion.combination.contains(card));
  }
}

module.exports = Player;
