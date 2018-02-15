const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');


describe('GET /game', function(){
  it('should respond with landing page', function(done){
    request(app)
      .get('/game')
      .expect(200)
      .expect(/CLUEDO - Solve The Murder Mystery/)
      .expect(/Number Of Players :/)
      .expect(/Game Id :/)
      .end(done);
  });
});

describe('POST /game/new', function(done){
  it('should create game and redirect to player detail form',function(done){
    request(app)
      .post('/game/new')
      .send('numberOfPlayers=3')
      .expect(302)
      .redirectsTo('/game/join/1234')
      .end(done);
  })
});
