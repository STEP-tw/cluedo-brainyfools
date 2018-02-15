const chai = require('chai');
const assert = chai.assert;
const request = require('supertest');

const app = require('../app.js');

describe('app',()=>{
  describe('GET /game/join/:id',()=>{
    it('serves enrolling form to enter player\'s name',done=>{
      request(app)
        .get('/game/join/:id')
        .expect(200)
        .expect(/Joining this/)
        .end(done);
    });
  });
});
