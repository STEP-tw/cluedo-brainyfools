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


// describe('POST /game/join/:id',()=>{
//   it('redirects to waiting page',done=>{
//     request(app)
//       .post('/game/join/1234')
//       .set('cookie','gameId=1234;playerId=1')
//       .expect(302)
//       .expect('Location','/game/1234/wait')
//       .end(done);
//   });
// });
