const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');

let games = app.games;

const idGen = app.idGenerator;

describe('#app', () => {
  beforeEach(() => {
    app.games = { '1234': new Game(3) };
    let game = app.games['1234'];
    game.addPlayer('neeraj', 11);
    game.addPlayer('omkar', 12);
    game.addPlayer('pranav', 13);
    app.idGenerator = () => {
      return 123;
    };
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('/game/:gameId/status', () => {
    it("should return json object with id of player related to turn", done => {
      request(app)
        .get('/game/1234/status')
        .expect(res => {
          let expected = {
            currentPlayer: {
              name: 'neeraj',
              character: {
                "color": "#bf0000",
                "name": "Miss Scarlett",
                turn: 1
              }
            }
          };
          assert.deepEqual(res.body, expected);
        })
        .end(done);
    });
  });
});
