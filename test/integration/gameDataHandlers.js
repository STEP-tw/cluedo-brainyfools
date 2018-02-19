const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

let games = app.games;

const idGen = app.idGenerator;

describe('app', () => {
  beforeEach(() => {
    app.idGenerator = () => {
      return 123;
    };
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET /game/1234/data', () => {
    it('should not return all players data', function (done) {
      let playerId = 0;
      app.idGenerator = () => {
        return ++playerId;
      };
      let gameId = '1234';
      let message = 'All players have already joined in Game';
      request(app).post('/game/join/1234').send("name=Madhuri")
        .end(() => {
          request(app).post('/game/join/1234').send("name=Neeraj")
            .end(() => {
              let expected = {
                1: {
                  name: "Madhuri",
                  character: {
                    name: "Miss Scarlett",
                    color: "#bf0000"
                  }
                },
                2: {
                  name: "Neeraj",
                  character: {
                    "color": "#ffdb58",
                    "name": "Col. Mustard"
                  }
                }
              }
              request(app).get('/game/1234/data')
                .expect((res) => {
                  assert.deepEqual(res.body, expected);
                })
                .end(done);
            });
        });
    });
  });

});
