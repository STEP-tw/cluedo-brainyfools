const assert = require('chai').assert;
const getTime = require('../../src/utils/time.js');

describe('#getTime', function(){
  it('should return currentTime', function(done){
    let time = getTime();
    setTimeout(()=>{
      let anotherTime = getTime();
      assert.approximately(time,anotherTime,515);
      done();
    },500);
  });
});
