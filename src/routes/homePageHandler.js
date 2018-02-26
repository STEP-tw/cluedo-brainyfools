const Game = require('../models/game.js');

const isValidPlayerCount = function(numberOfPlayers) {
  let validPlayersCount = ['3','4','5','6'];
  return validPlayersCount.includes(numberOfPlayers);
};

const serveHomepage = function(req, res) {
  let homepage = req.app.fs.readFileSync('./templates/home.html', 'utf-8');
  homepage = homepage
    .replace('{{INVALIDCOUNT}}', req.cookies.wrongCount || '')
    .replace('{{default}}', req.cookies.invalidGameId ? 'join' : 'create')
    .replace('{{INVALIDGAMEID}}', req.cookies.invalidGameId || '');
  res.clearCookie('invalidGameId');
  res.type('html');
  res.send(homepage);
};

const createGame = function(req, res) {
  let numberOfPlayers = req.body['numberOfPlayers'];
  let game = new Game(numberOfPlayers);
  let gameId = req.app.getGameId();
  res.clearCookie('wrongCount');
  res.clearCookie('invalidGameId');
  req.app.games[gameId] = game;
  res.redirect(`/game/join/${gameId}`);
};

const verifyPlayersCount = function(req, res, next) {
  let numberOfPlayers = req.body['numberOfPlayers'];
  if (isValidPlayerCount(numberOfPlayers)) {
    next();
    return;
  }
  res.cookie('wrongCount', 'Select valid number of players (3 to 6)');
  res.redirect('/game');
};

const verifyGameId = function(req, res, next) {
  let gameId = req.body['gameId'];
  if (req.app.games[gameId]) {
    next();
    return;
  }
  res.cookie('invalidGameId', 'Enter valid game id');
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
