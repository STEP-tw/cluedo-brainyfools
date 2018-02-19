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

  beforeEach(()=>{
    app.games = {};
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET game/1234/boardstatus', () => {
    it('should return number of players who have joined the game', done => {
      request(app)
        .post('/game/new')
        .send('numberOfPlayers=3')
        .end(() => {
          request(app)
            .post('/game/join/1234')
            .send('name=omkar')
            .set('cookie', `playerId=123`)
            .end(() => {
              request(app)
                .get('/game/1234/boardstatus')
                .expect((res) => {
                  let expected = [
                    {
                      "name":"Miss Scarlett",
                      "position":1}
                  ];
                  assert.deepEqual(res.body, expected);
                })
                .end(done);
            });
        });
    });
  });
});
