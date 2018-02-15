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
  });
  it('should redirect to home when game created with invalid count',done=>{
    let invalidCountCookie=[
      'invalidPlayerCount=true',
      'message=Select valid number of players (3 to 6)'
    ];
    request(app)
      .post('/game/new')
      .send('numberOfPlayers=2')
      .expect(302)
      .redirectsTo('/game')
      .cookie.match('invalidPlayerCount',/true/)
      .end(()=>{
        request(app)
          .get('/game')
          .set('Cookie',invalidCountCookie)
          .expect(200)
          .body.include('Select valid number of players (3 to 6)')
          .end(done);
      });
  });
});

describe('GET /game/join/:id',()=>{
  it('serves enrolling form to enter player\'s name',done=>{
    request(app)
      .get('/game/join/:id')
      .expect(200)
      .expect(/Joining this/)
      .end(done);
  });
});
