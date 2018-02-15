const Game = require('../models/game.js');

const serveHomepage = function(req,res,next) {
  res.statusCode = 200;
  let homepage = req.app.fs.readFileSync('./public/home.html');
  res.write(homepage);
  res.end();
  next();
};

const createGame = function(req,res) {
  let numberOfPlayers = req.body['numberOfPlayers'];
  let game = new Game(numberOfPlayers);
  let gameId = '1234';
  res.statusCode = 302;
  res.redirect(`/game/join/${gameId}`);
  res.end();
};

module.exports = {
  serveHomepage: serveHomepage,
  createGame: createGame
};
