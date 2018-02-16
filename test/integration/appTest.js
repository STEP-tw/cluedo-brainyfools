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

  it('should clear invalidCountCookie after creating game', done=>{
    let invalidCountCookie=[
      'invalidPlayerCount=true',
      'message=Select valid number of players (3 to 6)'
    ];
    let expired = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    request(app)
      .post('/game/new')
      .send('numberOfPlayers=4')
      .set('cookie',invalidCountCookie)
      .expect(302)
      .redirectsTo('/game/join/1234')
      .cookie.include('invalidPlayerCount',expired)
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
      .get('/game/join/1234')
      .expect(200)
      .expect(/Joining Game : 1234/)
      .end(done);
  });
});

describe('POST /game/join', ()=>{
  it('should redirect to player detail page for valid game id',done=>{
    request(app)
      .post('/game/join')
      .send('gameId=1234')
      .redirectsTo('/game/join/1234')
      .end(done);
  });

  it('should clear invalidGameId after creating game', done=>{
    let invalidGameIdCookie=[
      'invalidGameId=true',
      'message=Enter valid game id'
    ];
    let expired = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    request(app)
      .post('/game/join')
      .send('gameId=1234')
      .set('Cookie',invalidGameIdCookie)
      .expect(302)
      .redirectsTo('/game/join/1234')
      .cookie.include('invalidGameId',expired)
      .end(done);
  });

  it('should redirect to game page for invalid game id',done=>{
    let invalidGameIdCookie = [
      'invalidGameId=true',
      'message=Enter valid game id'
    ];
    request(app)
      .post('/game/join')
      .send('gameId=123')
      .redirectsTo('/game')
      .cookie.match('invalidGameId',/true/)
      .end(()=>{
        request(app)
          .get('/game')
          .set('Cookie',invalidGameIdCookie)
          .expect(200)
          .end(done);
      });
  });
});


describe('POST /game/join/:id',()=>{
  it('redirects to waiting page',done=>{
    request(app)
      .post('/game/join/1234')
      .set('cookie','playerId=1')
      .expect(302)
      .expect('Location','/game/1234/wait')
      .end(done);
  });
});
