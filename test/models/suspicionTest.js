const chai = require('chai');
const assert = chai.assert;
const Suspicion = require('../../src/models/suspicion.js');

describe('Suspicion', function(){
  let combination;
  beforeEach(()=>{
    combination={
      character:"Dr. Orchid",
      weapon:"Revolver",
      room:"Hall"
    };
 });
  describe('#combination', function(){
    it('should return suspicion combination cards',function() {
      let suspicionCombination = new Suspicion(combination,"ketan");
      assert.equal(suspicionCombination.combination,combination);
    });
  });
  describe('#suspector', function(){
    it('should return suspector name', function(){
      let suspicionCombination = new Suspicion(combination,"ketan");
      assert.equal(suspicionCombination.suspector,'ketan');
    });
  });
});
