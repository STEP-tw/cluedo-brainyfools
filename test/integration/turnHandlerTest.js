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
    game.addPlayer('neeraj', 11,1);
    game.addPlayer('omkar', 12,2);
    game.addPlayer('pranav', 13,3);
  });

  after(() => {
    app.idGenerator = idGen;
  });

  describe('POST /game/1234/move',()=>{
    beforeEach(()=>{
      app.games['1234'].start();
    })
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
      // app.games['1234'].start();
      app.games['1234'].players['11'].updatePos(9);
      app.games['1234'].rollDice();
      request(app)
        .post('/game/1234/move')
        .send({position:'Dining'})
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
    beforeEach(()=>{
      app.games['1234'].start();
    });
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
          assert.deepEqual(res.body, {error: "access denied"});
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
    beforeEach(()=>{
      app.games['1234'].start();
    });
    it('should pass turn to the next player',done=>{
      request(app)
        .get('/game/1234/rolldice')
        .set('cookie', 'playerId=11')
        .end(()=>{
          request(app)
            .get('/game/1234/pass')
            .set('cookie', 'playerId=11')
            .expect(res=>{
              assert.deepEqual(res.body, {passed: true});
            })
            .end(done);
        });
    });

    it('should give an error if it is not player\'s turn',done=>{
      request(app)
        .get('/game/1234/pass')
        .set('cookie', 'playerId=12')
        .expect(res=>{
          assert.deepEqual(res.body, {error: "Not your turn."});
        })
        .end(done);
    });
  });

  describe('POST /game/1234/suspect',()=>{
    beforeEach(()=>{
      app.games['1234'].start();
      app.games['1234'].updatePlayerPos('Hall');
    });
    it('should create a suspicion',done=>{
      request(app)
        .post('/game/1234/suspect')
        .set('cookie', 'playerId=11')
        .send({character:'Miss Scarlett',weapon:'Dragger'})
        .expect(res=>{
          assert.deepEqual(res.body, {
            suspected: true,
            suspector:"Miss Scarlett"
          });
        })
        .end(done);
    });
  });

  describe('POST /game/1234/leave',()=>{
    it('should respond with player status',done=>{
      app.games = {'1234': new Game(3)};
      app.games['1234'].addPlayer('Pranav',1,1);
      app.games['1234'].addPlayer('Patel',2,2);
      app.games['1234'].addPlayer('Raghu',3,3);
      app.games['1234'].start();
      request(app)
        .post('/game/1234/leave')
        .set('cookie', 'playerId=1')
        .expect(res=>{
          assert.deepEqual(res.body, {
            playersStatus: { '1': false, '2': true, '3': true }
          });
        })
        .end(done);
    });
  });

  describe('GET game/1234/suspicion',()=>{
    beforeEach(()=>{
      app.games['1234'].start();
      app.games['1234'].updatePlayerPos('c');
    });
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
                {_room: {_name: 'c', _type: 'Room'},
                 _weapon: {_name: 'b', _type: 'Weapon'},
                 _character: {_name: 'a', _type: 'Character'}},
              "canBeCancelled": false,
              "currentPlayer": "neeraj",
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

  describe('GET /game/1234/murderCombination', function(){
    it('should return murder combination if someone wins', function(done){
      app.games[1234].start();
      app.games[1234]._state = 'win';
      let murderCombination = app.games[1234].murderCombination;
      request(app)
        .get('/game/1234/murderCombination')
        .set('cookie', 'playerId=11')
        .expect(res=>{
          assert.deepEqual(res.body,murderCombination);
        })
        .end(done);
    });

    it('should return murder combination if game has drawn', function(done){
      app.games[1234].start();
      app.games[1234]._state = 'draw';
      let murderCombination = app.games[1234].murderCombination;
      request(app)
        .get('/game/1234/murderCombination')
        .set('cookie', 'playerId=11')
        .expect(res=>{
          assert.deepEqual(res.body,murderCombination);
        })
        .end(done);
    });

    it('should return error if game is running', function(done){
      app.games[1234].start();
      app.games[1234]._state = 'running';
      request(app)
        .get('/game/1234/murderCombination')
        .set('cookie', 'playerId=11')
        .expect(res=>{
          assert.deepEqual(res.body,{error:'Can not send murder combination'});
        })
        .end(done);
    });
  });
  describe('GET game/1234/accusation',function() {
    it('should give current accusation combination',function(done) {
      app.games[1234].start();
      app.games[1234].players[11].character.position = 'lounge';
      request(app)
        .post('/game/1234/accuse')
        .set('cookie', 'playerId=11')
        .send({character:'Miss Scarlett',weapon:'Revolver'})
        .expect(res=>{
          assert.deepEqual(res.body, {
            status: true,
            accusser:"Miss Scarlett"
          });
        })
        .end(()=>{
          request(app)
            .get('/game/1234/accusation')
            .set('cookie', 'playerId=11')
            .expect(res=>{
              assert.deepEqual(res.body,{
                room:'lounge',
                weapon:'Revolver',
                character:'Miss Scarlett'
              });
            })
            .end(done);
        });
    })
  })
});
