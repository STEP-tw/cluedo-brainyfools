const chai = require('chai');
const assert = chai.assert;
const Room = require('../../src/models/room.js');


describe('Room',()=>{
  let room;
  beforeEach(()=>{
    room={
      "name":"Lounge",
      "doorPosition" : 6,
      "connectedRoom" : "Conservatory"
    };
    room=new Room(room);
  });
  describe('#hasSecretPass',()=>{
    it('should return room have secret pass or not',()=>{
      assert.ok(room.hasSecretPass());
    });
    it('should return room have secret pass or not',()=>{
      room._connectedRoom='';
      assert.notOk(room.hasSecretPass());
    });
  });
  describe('#doorPosition',()=>{
    it('should return door position of room',()=>{
      assert.equal(room.doorPosition,6);
    });
  });
  describe('#connectedRoom',()=>{
    it('should return connected room of corresponding room',()=>{
      assert.equal(room.connectedRoom,"Conservatory");
    });
  });
  describe('#name',()=>{
    it('should return name of room',()=>{
      assert.equal(room.name,"Lounge");
    });
  });
});
