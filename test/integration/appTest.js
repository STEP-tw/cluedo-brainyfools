const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

let games = app.games;

const idGen = app.idGenerator;
describe('app', () => {
  before(() => {
    app.idGenerator = () => {
      return 123;
    };
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET /game', function () {
    it('should respond with landing page', function (done) {
      request(app)
        .get('/game')
        .expect(200)
        .expect(/CLUEDO - Solve The Murder Mystery/)
        .expect(/Number Of Players :/)
        .expect(/Game Id :/)
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
      it('redirect to wait page if player is already joined', (done) => {
        request(app)
          .post('/game/join/1234')
          .send("name=madhuri")
          .redirectsTo('/game/1234/wait')
          .end(() => {
            request(app)
              .get('/game/join/1234')
              .set("cookie", `playerId=123`)
              .cookie.isUndefined('playerId')
              .redirectsTo('/game/1234/wait')
              .end(done);
          });
      });
    });

    describe('GET game/1234/wait', () => {
      it('should serve waiting page', done => {
        request(app)
          .post('/game/join/1234')
          .send("name=omkar")
          .set('cookie', 'playerId=123')
          .redirectsTo('/game/1234/wait')
          .cookie.include('playerId', '123;')
          .end(() => {
            request(app)
              .get('/game/1234/wait')
              .set('cookie', 'playerId=123')
              .expect(200)
              .expect(/Welcome omkar/)
              .expect(/1234/)
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
          .expect(/Joining Game : 1234/)
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
