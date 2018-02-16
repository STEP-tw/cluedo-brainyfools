const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

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

  describe('POST /game/new', function (done) {
    it('should create game and redirect to player detail form', (done)=>{
      request(app)
        .post('/game/new')
        .send('numberOfPlayers=3')
        .expect(302)
        .redirectsTo('/game/join/1234')
        .end(done);
    });

    it('should not create game for invalid no of players', function(){
      let invalidCountCookie = [
        'invalidPlayerCount=true',
        'message=Select valid number of players (3 to 6)'
      ];
      request(app)
        .post('/game/new')
        .send('numberOfPlayers=7')
        .expect(302)
        .redirectsTo('/game')
        .end(()=>{
          request(app)
          .get('/game')
          .set('cookie',invalidCountCookie)
          .expect(200)
          .end(done);
        });
    });

    it('should clear invalidCountCookie after creating game', done => {
      let invalidCountCookie = [
        'invalidPlayerCount=true',
        'message=Select valid number of players (3 to 6)'
      ];
      let expired = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      request(app)
        .post('/game/new')
        .send('numberOfPlayers=4')
        .set('cookie', invalidCountCookie)
        .expect(302)
        .redirectsTo('/game/join/1234')
        .cookie.include('invalidPlayerCount', expired)
        .end(done);
    });
  });

  describe('POST /game/join/1234', () => {
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
        .redirectsTo('/game/join/1234')
        .end(done);
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
  });

  describe('GET /game/join/1234', () => {
    it('serves enrolling form to enter player\'s name', done => {
      request(app)
        .get('/game/join/1234')
        .expect(200)
        .expect(/Joining Game : 1234/)
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
        'invalidGameId=true',
        'message=Enter valid game id'
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

    it('should redirect to game page for invalid game id', done => {
      let invalidGameIdCookie = [
        'invalidGameId=true',
        'message=Enter valid game id'
      ];
      request(app)
        .post('/game/join')
        .send('gameId=123')
        .redirectsTo('/game')
        .cookie.match('invalidGameId', /true/)
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
