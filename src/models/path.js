const Room = require('./room.js');
class Path {
  constructor() {
    this._rooms=[];
  }
  canEnterIntoRoom(roomName, forwardPos, backwardPos){
    let room = this.getRoom(roomName);
    if(room){
      let doorPosition = +room.doorPosition;
      if(doorPosition<forwardPos && doorPosition>backwardPos ) {
        return true;
      }
      if(doorPosition>backwardPos) {
        return true;
      }
    }
    return false;
  }
  getRoom(name){
    return this._rooms.find(room=>{
      return room.name.toLowerCase().includes(name);
    });
  }
  addRooms(rooms){
    this._rooms=rooms.map((room)=>{
      return new Room(room);
    });
  }
  canGoToConnectedRoom(roomName,connectedRoomName){
    let room = this.getRoom(roomName);
    return room && room.connectedRoom.toLowerCase() == connectedRoomName;
  }
}

module.exports = Path;
