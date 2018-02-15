const chai = require('chai');
const assert = chai.assert;
const Character = require('../../src/models/character.js');

describe('Character',()=>{
  let character;
  beforeEach(()=>{
    character = new Character('Rev. Green','green',0,4);
  });
  describe('#name',()=>{
    it('should return character\'s name',()=>{
      assert.equal(character.name,'Rev. Green');
    });
  });
  describe('#tokenColor',()=>{
    it('should return character\'s token color',()=>{
      assert.equal(character.tokenColor,'green');
    });
  });
  describe('#position',()=>{
    it('should return character\'s position',()=>{
      assert.equal(character.position,0);
    });
  });
  describe('#turn',()=>{
    it('should return character\'s turn',()=>{
      assert.equal(character.turn,4);
    });
  });
});
