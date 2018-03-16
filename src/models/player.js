let Suspicion = require('./suspicion.js');
const ActivityLog = require('./activityLog');

class Player {
  constructor(name,character, getDate) {
    this._name = name;
    this._character = character;
    this._cards = [];
    this._lastSuspicion= {};
    this._inRoom = false;
    this._log = new ActivityLog(getDate);
    this._active = true;
    this._played=false;
    this._hasLeft=false;
  }
  get name(){
    return this._name;
  }
  get characterName(){
    return this._character.name;
  }
  get inRoom(){
    return this._inRoom;
  }
  set inRoom(val){
    this._inRoom = val;
  }
  get turn(){
    return this._character.turn;
  }
  get character(){
    return this._character;
  }
  get position(){
    return this._character.position;
  }
  get tokenColor(){
    return this._character.tokenColor;
  }
  isActive(){
    return this._active;
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
  canSuspect() {
    if(!this.isActive()){
      return false;
    }
    if(this.isEmpty(this._lastSuspicion)){
      return true;
    }
    let room = this.character.position;
    return this._lastSuspicion.combination.room.name != room;
  }
  canCancel(suspicion){
    return this._cards.some(card=>suspicion.combination.contains(card));
  }
  getCancellingCards(suspicion){
    return this._cards.filter(card=>suspicion.combination.contains(card));
  }
  addActivity(activity){
    this._log.addActivity(activity);
  }
  getActivitiesAfter(time){
    return this._log.getActivitiesAfter(time);
  }
  deactivate(){
    this._active = false;
  }
  hasPlayed(){
    return this._played;
  }
  played(val=true){
    this._played=val;
  }
  shutDown(){
    this._hasLeft=true;
    this.deactivate();
    return true;
  }
}

module.exports = Player;
