const chai = require('chai');
const assert = chai.assert;
const Path = require('../../src/models/path.js');
const Room = require('../../src/models/room.js');

let rooms=[
  {
    "name":"Lounge",
    "doorPosition" : 6,
    "connectedRoom" : "Conservatory"
  },
  {
    "name":"Conservatory",
    "doorPosition" : 35,
    "connectedRoom" : "Lounge"
  },
  {
    "name":"Dining",
    "doorPosition" : 16,
    "connectedRoom" : ""
  },
  {
    "name":"Hall",
    "doorPosition" : 74,
    "connectedRoom" : ""
  }
];

describe("Path",()=>{
  let path;
  beforeEach(()=>{
    path=new Path(1,86);
    path.addRooms(rooms);
  });
  describe("#addRooms",()=>{
    it('should add rooms to path',()=>{
      assert.equal(path._rooms.length,4);
    });
  });
  describe("#getRoom",()=>{
    it('should give room by name',()=>{
      let actual=path.getRoom('Lounge');
      let room={
        "name":"Lounge",
        "doorPosition" : 6,
        "connectedRoom" : "Conservatory"
      };
      let expected=new Room(room);
      assert.deepEqual(actual,expected);
    });
  });
  describe("#canEnterIntoRoom",()=>{
    it('should return true if player can enter into room',()=>{
      let args = {
        val:3,
        curPlayerPos: 2,
        clickpos: 'Lounge',
        forwardDis: 76,
        backDis: 4,
        atStart: false
      };
      assert.isOk(path.canEnterIntoRoom(args));
      args = {
        val:2,
        curPlayerPos: 1,
        clickpos: 'Lounge',
        forwardDis: 3,
        backDis: 75,
        atStart: false
      };
      assert.isOk(path.canEnterIntoRoom(args));
    });
    it('should return false if player can not enter into room',()=>{
      let args = {
        val:3,
        curPlayerPos: 3,
        clickpos: 'Kitchen',
        forwardDis: 75,
        backDis: 1,
        atStart: false
      };
      assert.isNotOk(path.canEnterIntoRoom(args));
      args = {
        val:2,
        curPlayerPos: 1,
        clickpos: 'Lounge',
        forwardDis: 0,
        backDis: 0,
        atStart: false
      };
      assert.isNotOk(path.canEnterIntoRoom(args));
    });
  });
  describe('#canGoToConnectedRoom',()=>{
    it('should return true when given both inputs are rooms and room is connected',()=>{
      assert.isOk(path.canGoToConnectedRoom(3,'Lounge',35));
    });

    it('should return false when given both inputs are rooms and room is not connected',()=>{
      assert.isNotOk(path.canGoToConnectedRoom(2,'Hall','Conservatory'));
    });
  });
  describe('#distanceForward',()=>{
    it('should not return any distance if given positions are invalid',()=>{
      assert.isUndefined(path.distanceForward([1,2,3],-9,-8));
    });
  });
  describe('#getConnectedRoom', function(){
    it('should return connected room name if it has', function(){
      assert.equal(path.getConnectedRoom('Lounge'),'Conservatory');
      assert.equal(path.getConnectedRoom('Conservatory'),'Lounge');
    });
    it('should return "" if it doesn\'t have', function(){
      assert.equal(path.getConnectedRoom('Hall'),'');
      assert.equal(path.getConnectedRoom('Dining'),'');
    });
  });
});
