const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');
const Card = require('../../src/models/card.js');


const idGen = app.idGenerator;
describe('turnHandler', () => {
  before(() => {
    app.idGenerator = () => {
      return 123;
    };
    app.getGameId = () => 1234;
  });

  beforeEach(() => {
    app.games = {'1234': new Game(3)};
    let game = app.games['1234'];
    game.addPlayer('neeraj', 11);
    game.addPlayer('omkar', 12);
    game.addPlayer('pranav', 13);
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('POST /game/1234/move',()=>{
    it('should return error for invalid pos',(done)=>{
      app.games['1234'].rollDice();
      request(app)
        .post('/game/1234/move')
        .send({position:23})
        .set('cookie','playerId=11')
        .expect((res)=>{
          assert.deepEqual(res.body, {error:'Invalid move'});
        }).end(done);
    });
    it('should add activity if player entered into room',(done)=>{
      app.games['1234'].start();
      app.games['1234'].players['11'].updatePos(9);
      app.games['1234'].rollDice();
      request(app)
        .post('/game/1234/move')
        .send({position:'dining'})
        .set('cookie','playerId=11')
        .expect((res)=>{
          assert.deepEqual(res.body, {moved:true});
        }).end(done);
    });
    it('should return moved true for valid pos',(done)=>{
      let val = app.games['1234'].rollDice();
      request(app)
        .post('/game/1234/move')
        .set('cookie','playerId=11')
        .send({position:69+val})
        .expect((res)=>{
          assert.deepEqual(res.body, {moved:true});
        })
        .end(done);
    });
    it('should return error for wrong turn',(done)=>{
      app.games['1234'].rollDice();
      request(app)
        .post('/game/1234/move')
        .send({position:23})
        .set('cookie','playerId=12')
        .expect((res)=>{
          assert.deepEqual(res.body, {error:'Not your turn.'});
        }).end(done);
    });
    it('should return error when no pos is given',(done)=>{
      app.games['1234'].rollDice();
      request(app)
        .post('/game/1234/move')
        .set('cookie','playerId=11')
        .expect((res)=>{
          assert.deepEqual(res.body, {error:'Provide position to move'});
        }).end(done);
    });
  });

  describe('GET game/1234/rolldice', () => {
    it('should give a value when player rolls a dice', done => {
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=11')
        .expect((res) => {
          let actual = res.body.value;
          assert.isAbove(actual, 0);
          assert.isBelow(actual, 7);
        })
        .end(done);
    });
    it('should give a error when other player rolls a dice', done => {
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=12')
        .expect((res) => {
          assert.deepEqual(res.body, {error: "Not your turn."});
        })
        .end(done);
    });
    it('should give an error when player is not in game', done => {
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=123456')
        .expect((res) => {
          assert.deepEqual(res.body, {error: "Not your turn."});
        })
        .end(done);
    });
    it('should give same value on rollong dice two times', done => {
      let val = 0;
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=11')
        .expect((res) => {
          val = res.body.value;
          assert.isAbove(actual, 0);
          assert.isBelow(actual, 7);
        })
        .end(()=>{
          request(app)
            .get('/game/1234/rolldice')
            .set('cookie', 'playerId=11')
            .expect((res) => {
              assert.equal(res.body.value,val);
            })
            .end(done);
        });
    });
  });

  describe('GET /game/1234/pass',()=>{
    it('should pass turn to the next player',done=>{
      request(app)
        .get('/game/1234/pass')
        .set('cookie', 'playerId=11')
        .expect(res=>{
          assert.deepEqual(res.body, {passed: true});
        })
        .end(done);
    });

    it('should give an error if it is not player\'s turn',done=>{
      request(app)
        .get('/game/1234/pass')
        .set('cookie', 'playerId=1234')
        .expect(res=>{
          assert.deepEqual(res.body, {error: "Not your turn."});
        })
        .end(done);
    });

    it('should give status as false and murder combination if no active players are present',done=>{
      app.games[1234].start();
      app.games[1234].players[11].deactivate();
      app.games[1234].players[12].deactivate();
      app.games[1234].players[13].deactivate();
      let murderCombination = app.games[1234].murderCombination;
      request(app)
        .get('/game/1234/pass')
        .set('cookie', 'playerId=11')
        .expect(res=>{
          assert.deepEqual(res.body, {passed:false,
          murderCombination:murderCombination});
        })
        .end(done);
    });
  });

  describe('GET /game/1234/pass',()=>{
    it('should pass turn to the next player',done=>{
      request(app)
        .get('/game/1234/pass')
        .set('cookie', 'playerId=11')
        .expect(res=>{
          assert.deepEqual(res.body, {passed: true});
        })
        .end(done);
    });
  });

  describe('POST /game/1234/suspect',()=>{
    it('should create a suspicion',done=>{
      request(app)
        .post('/game/1234/suspect')
        .set('cookie', 'playerId=11')
        .send({character:'a',weapon:'b'})
        .expect(res=>{
          assert.deepEqual(res.body, {
            suspected: true,
            suspector:"Miss Scarlett"
          });
        })
        .end(done);
    });
  });

  describe('GET game/1234/suspicion',()=>{
    it('should give suspicion that has been raised',done=>{

      request(app)
        .post('/game/1234/suspect')
        .set('cookie', 'playerId=11')
        .send({character:'a',weapon:'b'})
        .expect(res=>{
          assert.deepEqual(res.body, {
            suspected: true,
            suspector:"Miss Scarlett"
          });
        })
        .end(()=>{
          request(app)
            .get('/game/1234/suspicion')
            .set('cookie', 'playerId=11')
            .expect(res=>{
              assert.deepEqual(res.body,{combination:
                {_room: {_name: 69, _type: 'Room'},
                 _weapon: {_name: 'b', _type: 'Weapon'},
                 _character: {_name: 'a', _type: 'Character'}},
              canBeCancelled: false,
              "suspector": "neeraj"});
            })
            .end(done);
        });
    });
  });

  describe('POST /game/1234/accuse',()=>{
    it('should create an accusation',done=>{
      app.games[1234].start();
      app.games[1234].players[11].updatePos('hall');
      request(app)
        .post('/game/1234/accuse')
        .set('cookie', 'playerId=11')
        .send({character:'a',weapon:'b'})
        .expect(res=>{
          assert.deepEqual(res.body, {
            status: true,
            accusser:"Miss Scarlett"
          });
        })
        .end(done);
    });
  });

  describe('POST /game/1234/ruleOut', function(){
    it('should ruleOut a suspicion' , function(done){
      app.games[1234].start();
      app.games[1234].players[11].updatePos('hall');
      app.games[1234].players[12].addCard(new Card('a','Character'));
      request(app)
        .post('/game/1234/suspect')
        .set('cookie', 'playerId=11')
        .send({character:'a',weapon:'b'})
        .expect(res=>{
          assert.deepEqual(res.body, {
            suspected: true,
            suspector:"Miss Scarlett"
          })
        })
        .end((res)=>{
          request(app)
            .post('/game/1234/ruleOut')
            .set('cookie', 'playerId=12')
            .send({"card":"a"})
            .expect(/{"success":true}/)
            .end(done);
        })
    });

    it('should not ruleOut a suspicion' , function(done){
      app.games[1234].start();
      app.games[1234].players[11].updatePos('hall');
      app.games[1234].players[12].addCard(new Card('a','Character'));
      request(app)
        .post('/game/1234/suspect')
        .set('cookie', 'playerId=11')
        .send({character:'a',weapon:'b'})
        .expect(res=>{
          assert.deepEqual(res.body, {
            suspected: true,
            suspector:"Miss Scarlett"
          })
        })
        .end((res)=>{
          request(app)
            .post('/game/1234/ruleOut')
            .set('cookie', 'playerId=12')
            .send({"card":"b"})
            .expect(/{"success":false,"error":"Cannot rule out"}/)
            .end(done);
        })
    });
  });

});
