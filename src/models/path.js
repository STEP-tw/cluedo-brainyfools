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
  canEnterIntoRoom(args){
    if(this.isRoom(args.clickpos)){
      let doorPos = this.doorPositionOf(args.clickpos);
      let curPlayerPos = args.curPlayerPos;
      let doorDistance = this.distanceForward(this.cells,doorPos,curPlayerPos);
      if(doorDistance <= args.forwardDis) {
        return true;
      }
      doorDistance = this.distanceBack(this.cells,doorPos,curPlayerPos);
      if(doorDistance <= args.backDis) {
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
      return name && room.name.toLowerCase().includes(name);
    });
  }
  addRooms(rooms){
    this._rooms=rooms.map((room)=>{
      return new Room(room);
    });
  }
  isRoom(roomName){
    return this.getRoom(roomName) && true;
  }

  canGoToConnectedRoom(val,roomName,curPlayerPos){
    if(this.isRoom(roomName)){
      let connectedRoomName = this.getConnectedRoom(roomName);
      let connectedRoom = this.getRoom(connectedRoomName);
      if(connectedRoom) {
        let doorPosition = connectedRoom.doorPosition;
        return doorPosition == curPlayerPos ;
      }
    }
    return false;
  }
  doorPositionOf(roomName){
    let room = this.getRoom(roomName);
    return room && room.doorPosition;
  }
  getAllValidMoves(playerPos,diceVal){
    let allValidMoves = [];
    let forwardPos = +playerPos + diceVal;
    let backwardPos = +playerPos - diceVal;
    if(forwardPos>this.endingPoint){
      forwardPos-=this.endingPoint;
    }
    if(backwardPos<this.startingPoint){
      backwardPos+=this.endingPoint;
    }
    allValidMoves.push(forwardPos);
    allValidMoves.push(backwardPos);
    return allValidMoves;
  }
  getConnectedRoom(roomName){
    let room = this.getRoom(roomName);
    return room.connectedRoom.toLowerCase();
  }
}

module.exports = Path;
