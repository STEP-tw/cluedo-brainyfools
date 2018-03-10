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
      return name && room.name.includes(name);
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

  getConnectedRoom(roomName){
    let room = this.getRoom(roomName);
    return room.connectedRoom;
  }

  isSameDistance(forwardDistance,backDistance){
    return forwardDistance == backDistance;
  }

  validatePos(args){
    let forwardDis = args.forwardDis;
    let backDis = args.backDis;

    if(!this.isSameDistance(args.curPos,args.curPlayerPos) &&
    this.canGoToConnectedRoom(args.val,args.clickpos,args.curPlayerPos)){
      return true;
    }
    if(forwardDis > args.val && backDis > args.val) {
      return false;
    }
    if(args.val == forwardDis || args.val == backDis){
      return true;
    }
    if(this.isSameDistance(args.curPlayerPos,args.clickpos)){
      return false;
    }
    return (this.canEnterIntoRoom(args)) ||
    (this.isSameDistance(forwardDis,backDis) && (args.val == 1));
  }

  getDistances(curPlayerPos,pos){
    let cells = this.cells;
    let forwardDistance = this.distanceForward(cells,+curPlayerPos,+pos);
    let backDistance = this.distanceBack(cells,+curPlayerPos,+pos);
    return [forwardDistance,backDistance];
  }

  validateMove(pos,curPlayerPos,val){
    let inRoom = false;
    let clickpos = pos;
    let curPos = curPlayerPos;
    if(curPlayerPos == pos){
      return false;
    }
    if(this.isRoom(curPlayerPos)){
      inRoom = true;
      curPlayerPos = this.doorPositionOf(curPlayerPos);
      val--;
    }
    if(this.isRoom(pos)){
      pos = this.doorPositionOf(pos);
      !inRoom && val--;
    }
    let distances = this.getDistances(curPlayerPos,pos);
    let args = {
      val:val,
      curPos:curPos,
      curPlayerPos: +curPlayerPos,
      clickpos: clickpos,
      forwardDis: distances[0],
      backDis: distances[1],
    };
    return this.validatePos(args);
  }
}

module.exports = Path;
