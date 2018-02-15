const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');


describe('GET /game', function(){
  it('it should respond with HomePage', function(done){
    request(app)
      .get('/game')
      .expect(200)
      .expect(/CLUEDO - Solve The Murder Mystery/)
      .expect(/Number Of Players :/)
      .expect(/Game Id :/)
      .end(done);
  });
});
