const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

let games = app.games;

const idGen = app.idGenerator;

describe('#app',()=>{
  beforeEach(() => {
    app.idGenerator = () => {
      return 123;
    };
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('/game/:gameId/status',()=>{
    it("should return json object with id of player related to turn",done=>{
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
                .get('/game/1234/status')
                .expect(res=>{
                  let expected = {
                    "id": '123'
                  };
                  assert.deepEqual(res.body,expected);
                })
                .end(done);
            });
        });
    });
  });
});
