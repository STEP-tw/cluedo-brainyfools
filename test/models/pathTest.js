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
    "name":"Dinning Room",
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
    path=new Path(1,78);
    path.addRooms(rooms);
  })
  describe("#addRooms",()=>{
    it('should add rooms to path',()=>{
      assert.equal(path._rooms.length,4);
    })
  })
  describe("#getRoom",()=>{
    it('should give room by name',()=>{
      let actual=path.getRoom('lounge');
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
      assert.isOk(path.canEnterIntoRoom(3,2,'lounge',76,4));
      assert.isOk(path.canEnterIntoRoom(2,1,'lounge',3,75));
    })
    it('should return false if player can not enter into room',()=>{
      let actual=path.canEnterIntoRoom(3,3,'kitchen',75,1);
      assert.isNotOk(path.canEnterIntoRoom(2,1,'lounge',0,0));
      assert.isNotOk(actual);
    });
  });
  describe('#canGoToConnectedRoom',()=>{
    it('should return true when given both inputs are rooms and room is connected',()=>{
      assert.isOk(path.canGoToConnectedRoom('lounge',35));
    });

    it('should return false when given both inputs are rooms and room is not connected',()=>{
      assert.isNotOk(path.canGoToConnectedRoom('hall','conservatory'));
    });
  });
  describe('#distanceForward',()=>{
    it('should not return any distance if given positions are invalid',()=>{
      assert.isUndefined(path.distanceForward([1,2,3],-9,-8));
    });
  });
});
