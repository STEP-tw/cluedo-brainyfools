const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');

const idGen = app.idGenerator;
describe('app', () => {
  before(() => {
    app.games = {'1234': new Game(3)};
    let game = app.games['1234'];
    game.addPlayer('neeraj', 11,1);
    game.addPlayer('omkar', 12,2);
    app.idGenerator = () => {
      return 123;
    };
    app.getGameId = () => 1234;
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET game/1234/numOfPlayers', () => {
    it('should return number of players who have joined the game', done => {
      request(app)
        .get('/game/1234/numOfPlayers')
        .set('cookie','playerId=11')
        .expect((res) => {
          let expected = {
            color: "#bf0000",
            count: 2,
            start: false,
            link: '/game/1234'
          };
          assert.deepEqual(res.body, expected);
        })
        .end(done);
    });
  });

  describe('GET /game/234/wait', () => {
    it('should redirect to home page if game has not been created', done => {
      request(app)
        .get('/game/2344/wait')
        .redirectsTo('/game')
        .end(done);
    });
  });
});
