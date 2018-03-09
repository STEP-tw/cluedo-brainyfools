const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app.js');
const Game = require('../../src/models/game.js');

let getTime = function(start){
  return ()=>start++;
};

describe('logHandler', function(){
  let game;
  beforeEach(function(){
    game = new Game(3,getTime(1));
    game.addPlayer("Patel",1,1);
    game.addPlayer("Pranav",2,2);
    game.addPlayer("AJ",3,3);
    app.games[1234] = game;
  });

  describe('GET /game/1234/log/:time', function(){
    it('should return activities after given time', function(done){
      let playerId = 0;
      app.idGenerator = () => {
        return ++playerId;
      };
      game.start();
      request(app)
        .get('/game/1234/log/0')
        .set('cookie','playerId=1')
        .expect(res=>assert.deepEqual(res.body, [{"activity":"Game has started" , "time": 1 , color:''}]))
        .expect(200)
        .end(done);
    });
  });
});
