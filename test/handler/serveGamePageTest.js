const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');

describe('gameHandlers', function () {
  beforeEach(function () {
    let game = new Game(3);
    app.games['1234'] = game;
    game.addPlayer('neeraj', 11,1);
    game.addPlayer('omkar', 12,2);
    game.addPlayer('pranav', 13,3);
  });

  describe('POST /game/join/1234', () => {
    it('should not start the game if already started', function (done) {
      let message = 'All players have already joined in Game';
      request(app)
        .get('/game/1234')
        .set('cookie', ['playerId=13'])
        .expect(200)
        .end(() => {
          // Game should not start again
          request(app)
            .get('/game/1234')
            .set('cookie', ['playerId=13'])
            .body.include('<div class="title">Activity Log</div>')
            .expect(200)
            .end(done);
        });
    });
  });
});
