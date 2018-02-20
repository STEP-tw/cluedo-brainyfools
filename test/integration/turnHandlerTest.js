const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');

const idGen = app.idGenerator;
describe('turnHandler', () => {
  before(() => {
    app.idGenerator = () => {
      return 123;
    };
  });

  beforeEach(() => {
    app.games = { '1234': new Game(3) };
    let game = app.games['1234'];
    game.addPlayer('neeraj', 11);
    game.addPlayer('omkar', 12);
    game.addPlayer('pranav', 13);
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET game/1234/rolldice', () => {
    it('should give a value when player rolls a dice', done => {
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=11')
        .expect((res) => {
          let actual = res.body.value;
          assert.isAbove(actual, 0);
          assert.isBelow(actual, 7);
        })
        .end(done);
    });
    it('should give a error when other player rolls a dice', done => {
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=12')
        .expect((res) => {
          assert.deepEqual(res.body, { error: "Not your turn." });
        })
        .end(done);
    });
    it('should give a error when player is not in game', done => {
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=123456')
        .expect((res) => {
          assert.deepEqual(res.body, { error: "Not your turn." });
        })
        .end(done);
    });
  });
});
