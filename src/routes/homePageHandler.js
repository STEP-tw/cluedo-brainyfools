const Game = require('../models/game.js');

const isValidPlayerCount = function(numberOfPlayers) {
  let validPlayersCount = ['3','4','5','6'];
  return validPlayersCount.includes(numberOfPlayers);
};

const serveHomepage = function(req, res) {
  res.statusCode = 200;
  let homepage = req.app.fs.readFileSync('./public/home.html', 'utf-8');
  if (req.cookies.invalidPlayerCount) {
    let message = req.cookies.message;
    homepage = homepage.replace('<invalidPlayerCountMsg>', message);
  }
  if(req.cookies.invalidGameId) {
    let message = req.cookies.message;
    homepage = homepage.replace('<invalidGameId>', message);
  }
  res.send(homepage);
};

const createGame = function(req, res) {
  let numberOfPlayers = req.body['numberOfPlayers'];
  let game = new Game(numberOfPlayers);
  let gameId = '1234';
  res.clearCookie('invalidPlayerCount');
  res.clearCookie('invalidGameId');
  res.clearCookie('message');
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

const verifyGameId = function(req, res, next) {
  let gameId = req.body['gameId'];
  if (req.app.games[gameId]) {
    next();
    return;
  }
  res.cookie('invalidGameId', 'true');
  res.cookie('message', 'Enter valid game id');
  res.redirect('/game');
};

const joinGame = function(req,res) {
  let gameId = req.body['gameId'];
  res.clearCookie('invalidGameId');
  res.redirect(`/game/join/${gameId}`);
};

module.exports = {
  createGame:[verifyPlayersCount,createGame],
  joinGame:[verifyGameId,joinGame],
  servePage:[serveHomepage]
};
