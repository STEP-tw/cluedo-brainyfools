const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

let games = app.games;

const idGen = app.idGenerator;

describe('gameDataHandlers', () => {
  beforeEach((done) => {
    app.games = {};
    request(app)
      .post('/game/new')
      .send('numberOfPlayers=3')
      .end(() => {
        let game = app.games['1234'];
        game.addPlayer('neeraj', 11,1);
        game.addPlayer('omkar', 12,2);
        game.addPlayer('pranav', 13,3);
        done();
      });
    let playerId = 0;
    app.idGenerator = () => {
      return ++playerId;
    };
    app.getGameId = () => 1234;
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET /game/1234/data', () => {
    it('should return all players data', function (done) {
      let expected = {
        11: {
          name: "neeraj",
          cards:[],
          inRoom: false,
          character: {
            name: "Miss Scarlett",
            color: "#bf0000",
            turn: 1,
            position: 69
          }
        },
        2: {
          name: "omkar",
          inRoom: false,
          character: {
            "color": "#ffff00",
            "name": "Col Mustard",
            turn: 2,
            position: 56
          }
        },
        3: {
          name: "pranav",
          inRoom: false,
          character: {
            "color": "#ff69ff",
            "name": "Dr Orchid",
            "position": 49,
            "turn": 3
          }
        }
      };
      request(app)
        .get('/game/1234/data')
        .set('cookie','playerId=11')
        .expect((res) => {
          assert.deepEqual(res.body, expected);
        })
        .end(done);
    });
  });

});
