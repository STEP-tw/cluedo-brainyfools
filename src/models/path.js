const Room = require('./room.js');
class Path {
  constructor(startingPoint,endingPoint) {
    this._rooms=[];
    this.startingPoint = startingPoint;
    this.endingPoint = endingPoint;
  }
  get cells(){
    return Array(this.endingPoint)
      .fill(this.startingPoint)
      .map((ele,index)=>index+ele);
  }
  canEnterIntoRoom(val,curPlayerPos,roomName,forwardDistance,backDistance){
    let room = this.getRoom(roomName);
    if(room){
      let doorPos = +room.doorPosition;
      let doorDistance = this.distanceForward(this.cells,doorPos,curPlayerPos);
      if(doorDistance <= forwardDistance) {
        return true;
      }
      doorDistance = this.distanceBack(this.cells,doorPos,curPlayerPos);
      if(doorDistance <= backDistance) {
        return true;
      }
    }
    return false;
  }

  distanceForward(cells,from, to){
    let fromIndex = cells.indexOf(from);
    let toIndex= cells.indexOf(to);
    if(fromIndex<0 || toIndex<0) {
      return;
    }
    let distance = 0;
    while(fromIndex != toIndex){
      distance++;
      fromIndex = (fromIndex+1) % cells.length;
    }
    return distance;
  }

  distanceBack(cells,from, to){
    return this.distanceForward(cells,to,from);
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
