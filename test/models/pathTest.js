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
  let path=new Path();
  describe("#addRooms",()=>{
    it('should add rooms to path',()=>{
      path.addRooms(rooms);
      assert.equal(path._rooms.length,3);
    })
  })
  describe("#getRoom",()=>{
    it('should give room by name',()=>{
      path.addRooms(rooms);
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
    it('should return can player enter into room or not',()=>{
      path.addRooms(rooms);
      let actual=path.canEnterIntoRoom('lounge',7,5);
      assert.ok(actual);
    })
    it('should return can player enter into room or not',()=>{
      path.addRooms(rooms);
      let actual=path.canEnterIntoRoom('hall',2,73);
      assert.ok(actual);
    });
  });
  describe('#canGoToConnectedRoom',()=>{
    it('should return whether selected room is connected',()=>{
      path.addRooms(rooms);
      assert.isOk(path.canGoToConnectedRoom('lounge','conservatory'));
    });
  });
});
