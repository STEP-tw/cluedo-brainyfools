const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');

const idGen = app.idGenerator;
describe('boardStatusHandler', () => {
  beforeEach(() => {
    let game = new Game(3);
    app.games['1234'] = game;
    game._unAssignedChars.splice(0, 1);
    game.addPlayer("Pranav", 1, 1);
    game._unAssignedChars.splice(0, 1);
    game.addPlayer("Patel", 2, 2);
    game._unAssignedChars.splice(0, 1);
    game.addPlayer('neeraj', 3, 3);
    game.start();
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET game/1234/boardstatus', () => {
    it('should return number of players who have joined the game', done => {
      request(app)
        .get('/game/1234/boardstatus')
        .set('cookie', 'playerId=3')
        .expect((res) => {
          let expected = [{
              "name": "Miss Scarlett",
              "position": 69
            },
            {
              "name": "Col Mustard",
              "position": 56
            },
            {
              "name": "Dr Orchid",
              "position": 49,
            },
            {
              "inactive": true,
              "name": "Rev Green",
              "position": 79
            },
            {
              "inactive": true,
              "name": "Mrs Peacock",
              "position": 5
            },
            {
              "inactive": true,
              "name": "Prof Plum",
              "position": 13
            },
          ];
          assert.deepEqual(res.body, expected);
        })
        .end(done);
    });
  });
});
