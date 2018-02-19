const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');

const idGen = app.idGenerator;
describe('app', () => {
  before(() => {
    app.games = {};
    app.idGenerator = () => {
      return 123;
    };
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('GET game/1234/numOfPlayers', () => {
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
                .get('/game/1234/numOfPlayers')
                .expect((res) => {
                  let expected = {
                    count: 1,
                    start: false,
                    link: '/game/1234'
                  };
                  assert.deepEqual(res.body, expected);
                })
                .end(done);
            });
        });
    });
  });

  describe('GET /game/234/wait',()=>{
    it('should redirect to home page if game has not been created',done=>{
      request(app)
        .get('/game/2344/wait')
        .redirectsTo('/game')
        .end(done);
    });
  });
});
