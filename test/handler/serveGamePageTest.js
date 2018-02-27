const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

describe('gameHandlers', function () {
  beforeEach(function (done) {
    request(app)
      .post('/game/new')
      .send('numberOfPlayers=3')
      .expect(302)
      .redirectsTo('/game/join/1234')
      .end(done);
  });

  describe('POST /game/join/1234', () => {
    it('should not allow 4th player to join a 3 player game', function(done){
      let playerId = 0;
      app.idGenerator = () => {
        return ++playerId;
      };
      let gameId = '1234';
      let message = 'All players have already joined in Game';
      //Adding 1st Player
      request(app).post('/game/join/1234').send("name=omkar")
        .redirectsTo('/game/1234/wait')
        .cookie.include('playerId', '1;')
        .end(()=>{
        //Adding 2nd Player
          request(app).post('/game/join/1234').send("name=Pranav")
            .redirectsTo('/game/1234/wait')
            .cookie.include('playerId', '2;')
            .end(()=>{
              //Adding 3rd Player
              request(app).post('/game/join/1234').send("name=Patel")
                .redirectsTo('/game/1234/wait')
                .cookie.include('playerId', '3;')
                .end(()=>{
                  //get gameBoard Page (Game will start here)
                  request(app)
                    .get('/game/1234')
                    .set('cookie',['playerId=3'])
                    .expect(200)
                    .end(()=>{
                      // Game should not start again
                      request(app)
                        .get('/game/1234')
                        .set('cookie',['playerId=3'])
                        .body.include('<div class="title">Activity Log</div>')
                        .expect(200)
                        .end(done);
                    });
                });
            });
        });
    });
  });
});
