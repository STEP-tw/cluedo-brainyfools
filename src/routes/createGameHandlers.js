const Game = require('../models/game.js');

const isValidPlayerCount = function(numberOfPlayers) {
  return numberOfPlayers > 2 && numberOfPlayers < 7;
};

const serveHomepage = function(req, res) {
  res.statusCode = 200;
  let homepage = req.app.fs.readFileSync('./public/home.html', 'utf-8');
  if (req.cookies.invalidPlayerCount) {
    let message = req.cookies.message;
    homepage = homepage.replace('<invalidPlayerCountMsg>', message);
  }
  res.send(homepage);
};

const createGame = function(req, res) {
  let numberOfPlayers = req.body['numberOfPlayers'];
  let game = new Game(numberOfPlayers);
  let gameId = '1234';
  req.app.games[gameId] = game;
  res.redirect(`/game/join/${gameId}`);
};

const verifyPlayersCount = function(req, res, next) {
  let numberOfPlayers = req.body['numberOfPlayers'];
  if (isValidPlayerCount(numberOfPlayers)) {
    next();
    return;
  }
  res.cookie('invalidPlayerCount', 'true');
  res.cookie('message', 'Select valid number of players (3 to 6)');
  res.redirect('/game');
};

module.exports = {
  serveHomepage: serveHomepage,
  createGame: createGame,
  verifyPlayersCount: verifyPlayersCount
};
