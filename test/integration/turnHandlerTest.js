const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

const idGen = app.idGenerator;
describe('turnHandler', () => {
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

  describe('GET game/1234/rolldice', () => {
    it('should give a value when player rolls a dice', done => {
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
                .get('/game/1234/rolldice')
                .expect((res) => {
                  let actual = res.body['value'];
                  assert.isAbove(actual,0);
                  assert.isBelow(actual,7);
                })
                .end(done);
            });
        });
    });
  });
});
