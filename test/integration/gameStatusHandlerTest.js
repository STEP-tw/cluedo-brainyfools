const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');
const Combination = require('../../src/models/combination');
const Card = require('../../src/models/card');
let games = app.games;

const idGen = app.idGenerator;

describe('#gameStatusHandler', () => {
  let game;
  beforeEach(() => {
    app.games = {'1234': new Game(3)};
    game = app.games['1234'];
    game.addPlayer('neeraj', 11,1);
    game.addPlayer('omkar', 12,2);
    game.addPlayer('pranav', 13,3);
    game.start();
    app.idGenerator = () => {
      return 123;
    };
    app.getGameId = () => 1234;
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('/game/:gameId/status', () => {
    it("should return json object with id of player related to turn", done => {
      request(app)
        .get('/game/1234/status')
        .set('cookie','playerId=11')
        .expect(res => {
          let expected = {
            currentPlayer: {
              name: 'neeraj',
              inRoom: false,
              character: {
                "color": "#bf0000",
                "name": "Miss Scarlett",
                turn: 1,
                position:69
              }
            },
            "canSuspect": true,
            "inRoom": false,
            combination: {},
            suspecting: false,
            "accuseCombination": {},
            "accusing": false,
            "playersStatus" :{1:true,2:true,3:true},
            "secretPassage": '',
            "gameState":'running'
          };
          assert.deepEqual(res.body, expected);
        })
        .end(done);
    });
  });
  it("should return json object with combination object if suspecting is true",
    done => {
      let combination = {
        character:'Dr. Orchid',
        weapon:'Revolver',
        room:"Hall"
      };
      let character = new Card('Dr. Orchid', 'Character');
      let weapon = new Card('Revolver', 'Weapon');
      let room = new Card("Hall", 'Room');
      let combinationO = new Combination(room, weapon, character);
      game.updateSuspicionOf(11,combinationO);
      request(app)
        .get('/game/1234/status')
        .set('cookie', 'playerId=11')
        .expect(res => {
          let expected = {
            currentPlayer: {
              name: 'neeraj',
              inRoom: false,
              character: {
                "color": "#bf0000",
                "name": "Miss Scarlett",
                turn: 1,
                position:69
              }
            },
            "canSuspect": true,
            "inRoom": false,
            moved:true,
            combination: combination,
            suspecting: true,
            accusing: false,
            "accuseCombination": {},
            "playersStatus" :{1:true,2:true,3:true},
            "secretPassage" : '',
            "gameState":'running'
          };
          assert.deepEqual(res.body, expected);
        })
        .end(done);
    });
});
