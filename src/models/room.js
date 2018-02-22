class Room {
  constructor(room) {
    this._name=room.name;
    this._doorPosition=room.doorPosition;
    this._connectedRoom=room.connectedRoom;
  }
  hasSecretPass(){
    if(this._connectedRoom){
      return true;
    }
    return false;
  }
  get doorPosition(){
    return this._doorPosition;
  }
  get connectedRoom(){
    return this._connectedRoom;
  }
  get name(){
    return this._name;
  }
}

module.exports = Room;
