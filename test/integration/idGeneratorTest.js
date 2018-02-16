const assert = require('chai').assert;
const app = require('../../app.js');

describe('#idGenerator',()=>{
  it('should generate an id',()=>{
    let id = app.idGenerator();
    assert.closeTo(id,new Date().getTime(), 500);
  });
});
