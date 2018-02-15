const chai = require('chai');
const assert = chai.assert;
const request = require('supertest');

const app = require('../../app.js');

describe('GET /game/join/:id',()=>{
  it('serves enrolling form to enter player\'s name',done=>{
    request(app)
      .get('/game/join/1234')
      .expect(200)
      .expect(/Joining Game : 1234/)
      .end(done);
  });
});
