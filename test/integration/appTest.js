const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');

let games = app.games;

const idGen = app.idGenerator;

describe('#gameIdGen', function(){
  it('should generate uniq game ids starting from given number', function(){
    assert.equal(1234,app.getGameId(1234));
    assert.equal(1235,app.getGameId(1235));
  });
});


describe('app', () => {
  beforeEach(() => {
    app.idGenerator = () => {
      return 123;
    };
    app.getGameId = ()=>1234;
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET /game', function () {
    it('should respond with landing page', function (done) {
      request(app)
        .get('/game')
        .expect(200)
        .expect(/creategame/i)
        .expect(/Number Of Players/)
        .expect(/Game ID/)
        .end(done);
    });
  });

  describe('POST /game/new', function () {
    it('should create game and redirect to player detail form', (done) => {
      request(app)
        .post('/game/new')
        .send('numberOfPlayers=3')
        .expect(302)
        .redirectsTo('/game/join/1234')
        .end(done);
    });

    it('should not create game for invalid no of players', function (done) {
      let invalidCountCookie = [
        'wrongCount=Select valid number of players (3 to 6)'
      ];
      request(app)
        .post('/game/new')
        .send('numberOfPlayers=7')
        .expect(302)
        .redirectsTo('/game')
        .end(() => {
          request(app)
            .get('/game')
            .set('cookie', invalidCountCookie)
            .expect(200)
            .end(done);
        });
    });

    it('should clear invalidCountCookie after creating game', done => {
      let invalidCountCookie = [
        'wrongCount=Select valid number of players (3 to 6)'
      ];
      let expired = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      request(app)
        .post('/game/new')
        .send('numberOfPlayers=4')
        .set('cookie', invalidCountCookie)
        .expect(302)
        .redirectsTo('/game/join/1234')
        .cookie.include('wrongCount', expired)
        .end(done);
    });
  });

  describe('GET /game/:gameId',function (){
    it('should serve game page',(done)=>{
      app.games['1234'] = new Game(3);
      let game = app.games['1234'];
      game.addPlayer('Patel',1,1);
      game.addPlayer('Pranav',2,2);
      game.addPlayer('Madhuri',3,3);
      request(app)
        .get('/game/1234')
        .set('cookie','playerId=1')
        .contentType('text/html; charset=utf-8')
        .body.include('<div class="title">Activity Log</div>')
        .expect(200)
        .end(done);
    });
    it('should redirect to home page if invalid game id', (done)=>{
      request(app)
        .get('/game/3243')
        .redirectsTo('/game')
        .end(done);
    });
  });
  describe('enrollPageHandler', function(){
    it('serves enroll form page with message if name is not given', done => {
      app.games['1234'] = new Game(3);
      request(app)
        .post('/game/join/1234')
        .send("name=")
        .expect(200)
        .expect(/Enter a valid name/)
        .end(done);
    });
    it('redirects to waiting page', done => {
      request(app)
        .post('/game/join/1234')
        .send("name=omkar")
        .set('cookie', `playerId=123`)
        .redirectsTo('/game/1234/wait')
        .cookie.include('playerId', '123;')
        .end(done);
    });
  });
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
              .redirectsTo('/game/1234/wait').cookie.include('playerId', '2;')
              .end(()=>{
                //Adding 3rd Player
                request(app).post('/game/join/1234').send("name=Patel")
                  .redirectsTo('/game/1234/wait')
                  .cookie.include('playerId', '3;')
                  .end(()=>{
                    //Joining as a 4th Player in a 3 player game
                    request(app).post('/game/join/1234').send("name=Neeraj")
                      .redirectsTo('/game')
                      .cookie.include('invalidGameId',encodeURI(message))
                      .cookie.include('invalidGameId',`${gameId}`)
                      .end(done);
                  });
              });
          });
      });
      it('serves enroll form page with message if name is not given', done => {
        request(app)
          .post('/game/join/1234')
          .send("name=")
          .expect(200)
          .expect(/Enter a valid name/)
          .end(done);
      });
      it('redirects to waiting page', done => {
        request(app)
          .post('/game/join/1234')
          .send("name=omkar")
          .set('cookie', `playerId=123`)
          .redirectsTo('/game/1234/wait')
          .cookie.include('playerId', '123;')
          .end(done);
      });
    });

    describe('POST /game/join/1234', function(){
      it('redirects to enroll form page if name is not given', done => {
        request(app)
          .post('/game/join/1234')
          .send("name=")
          .expect(200)
          .expect(/Enter a valid name/)
          .end(done);
      });

      it('redirect to wait page if player is already joined', (done) => {
        request(app)
          .post('/game/join/1234')
          .send("name=madhuri")
          .redirectsTo('/game/1234/wait')
          .end(() => {
            request(app)
              .post('/game/join/1234')
              .send("name=madhuri")
              .set("cookie", `playerId=123`)
              .cookie.isUndefined('playerId')
              .redirectsTo('/game/1234/wait')
              .end(done);
          });
      });
    });


    describe('GET game/1234/wait', () => {
      let playerId = 0;
      beforeEach(function(done) {
        playerId = 0;
        app.idGenerator = () => {
          return ++playerId;
        };
        request(app)
          .post('/game/new')
          .send('numberOfPlayers=3')
          .expect(302)
          .redirectsTo('/game/join/1234')
          .end(done);
      });

      it('should serve waiting page', done => {
        request(app)
          .post('/game/join/1234')
          .send("name=omkar")
          .redirectsTo('/game/1234/wait')
          .cookie.include('playerId', '1;')
          .end(() => {
            game = app.games['1234'];
            game.addPlayer('neeraj', 11,1);
            game.addPlayer('omkar', 12,2);
            request(app)
              .get('/game/1234/wait')
              .set('cookie', 'playerId=1')
              .expect(200)
              .expect(/Welcome omkar/)
              .expect(/1/)
              .end(done);
          });
      });
      it('should redirect to waiting page if all players have not joined', done => {
        request(app)
          .post('/game/join/1234')
          .send("name=omkar")
          .redirectsTo('/game/1234/wait')
          .cookie.include('playerId', '1;')
          .end(() => {
            request(app)
              .get('/game/1234')
              .set('cookie', 'playerId=1')
              .redirectsTo('/game/1234/wait')
              .expect(res=>{
                assert.deepEqual(res.body,{'error':"All players have not joined yet."})
              })
              .end(done);
          });
      });
      it('should redirect to home page if game has not been created', done => {
        request(app)
          .get('/game/2435/wait')
          .redirectsTo("/game")
          .end(done);
      });
    });

    describe('GET /game/join/1234', () => {
      it('serves enrolling form to enter player\'s name', done => {
        request(app)
          .get('/game/join/1234')
          .expect(200)
          .expect(/Game ID : 1234/)
          .end(done);
      });

      it('should redirect to home page if game has not been created', done => {
        request(app)
          .get('/game/join/2345')
          .redirectsTo('/game')
          .end(done);
      });
    });
    describe('POST /game/join', () => {
      it('should redirect to player detail page for valid game id', done => {
        request(app)
          .post('/game/join')
          .send('gameId=1234')
          .redirectsTo('/game/join/1234')
          .end(done);
      });

    });


    describe('POST /game/join', () => {
      it('should redirect to player detail page for valid game id', done => {
        request(app)
          .post('/game/join')
          .send('gameId=1234')
          .redirectsTo('/game/join/1234')
          .end(done);
      });

      it('should clear invalidGameId after creating game', done => {
        let invalidGameIdCookie = [
          'invalidGameId=Enter valid game id'
        ];
        let expired = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        request(app)
          .post('/game/join')
          .send('gameId=1234')
          .set('Cookie', invalidGameIdCookie)
          .expect(302)
          .redirectsTo('/game/join/1234')
          .cookie.include('invalidGameId', expired)
          .end(done);
      });

      it('should not allow extra players to join a game', function (done) {
        request(app)
          .post('/game/join')
          .send('gameId=1234')
          .expect(302)
          .redirectsTo('/game/join/1234')
          .end(done);
      });

      it('should redirect to game page for invalid game id', done => {
        let invalidGameIdCookie = [
          'invalidGameId=Enter valid game id'
        ];
        request(app)
          .post('/game/join')
          .send('gameId=123')
          .redirectsTo('/game')
          .cookie.include('invalidGameId', encodeURI('Enter valid game id'))
          .end(() => {
            request(app)
              .get('/game')
              .set('Cookie', invalidGameIdCookie)
              .expect(200)
              .end(done);
          });
      });
    });
  });
});
