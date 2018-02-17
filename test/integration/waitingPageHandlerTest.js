const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

const idGen = app.idGenerator;

describe('app',()=>{
  before(() => {
    app.idGenerator = () => {
      return 123;
    };
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET game/1234/numOfPlayers',()=>{
    it('should return number of players who have joined the game',done=>{
      request(app)
        .post('/game/join/1234')
        .send('name=omkar')
        .set('cookie', `playerId=123`)
        .redirectsTo('/game/1234/wait')
        .cookie.include('playerId', '123;')
        .end(()=>{
          request(app)
            .get('/game/1234/numOfPlayers')
            .expect(200)
            .expect(/1/)
            .expect(/false/)
            .expect(/\/game\/1234/)
            .end(done);
        });
    });
  });
});
