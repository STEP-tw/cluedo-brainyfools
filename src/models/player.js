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
    return true;
  }
  updateSuspicion(combination){
    let suspicion = new Suspicion(combination,this._name);
    this._lastSuspicion = suspicion;
    return true;
  }
  canSuspect(room){
    return this._lastSuspicion.combination.room!=room;
  }
}

module.exports = Player;
