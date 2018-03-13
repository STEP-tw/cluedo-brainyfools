const express = require('express');
const cookieParser = require('cookie-parser');
const logRequest = require('./src/utils/logger');

const fs = require('fs');

const getGameStatus = require('./src/routes/gameStatusHandler.js');
const serveGameData = require('./src/routes/gameDataHandler.js');
const homePageHandler = require('./src/routes/homePageHandler.js');
const enrollGameHandlers = require('./src/routes/enrollGameHandlers.js');
const redirectToGame = enrollGameHandlers.redirectToGame;
const waitingPageHandlers = require('./src/routes/waitingPageHandlers.js');
const {serveWaitingPage} = waitingPageHandlers;
const serveGamePage = require('./src/routes/serveGamePageHandler.js');
const boardStatusHandler = require('./src/routes/boardStatusHandler');
const turnHandler = require('./src/routes/turnHandler');
const logHandler = require('./src/routes/logHandler');

const app = express();

app.fs = fs;
app.games = {};
app.idGenerator = () => {
  return new Date().getTime();
};

const gameIdGen = function(start){
  return ()=>start++;
};

app.getGameId = gameIdGen(1234);

const setGame = function (req, res, next) {
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  req.game = game;
  next();
};

const checkForValidPlayer = function(req,res,next){
  let playerId = req.cookies.playerId;
  if(req.game.getPlayer(playerId)){
    next();
    return;
  }
  res.status(302);
  res.location('/');
  res.type('json');
  res.send('{"error":"access denied"}');
};

const redirectToWait = function(req,res,next){
  let game = req.game;
  let gameId = req.params.gameId;
  let validWait = [`/wait`, `/numOfPlayers`];
  if (!game.haveAllPlayersJoined() && !validWait.includes(req.url)) {
    res.status(302);
    res.location(`/game/${gameId}/wait`);
    res.type('json');
    res.send('{"error":"All players have not joined yet."}');
    return;
  }
  next();
};

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);

app.use('/game/:gameId([\\d]+)', redirectToGame, setGame,
  checkForValidPlayer, redirectToWait);
app.use('/game/join/:gameId([\\d]+)', redirectToGame, setGame);

app.get(['/', '/game'], homePageHandler.servePage);
app.post('/game/new', homePageHandler.createGame);
app.post('/game/join', homePageHandler.joinGame);
app.get('/game/join/:gameId', enrollGameHandlers.serveEnrollingForm);
app.post('/game/join/:gameId', enrollGameHandlers.addPlayerToGame);

app.get('/game/:gameId/wait', serveWaitingPage);
app.get('/game/:gameId/numOfPlayers', waitingPageHandlers.getNumOfPlayers);
app.get('/game/:gameId/status', getGameStatus);
app.get('/game/:gameId/boardstatus', boardStatusHandler);
app.get('/game/:gameId', serveGamePage);
app.get('/game/:gameId/data', serveGameData);
app.get('/game/:gameId/rollDice', turnHandler.rollDice);
app.post('/game/:gameId/move',turnHandler.move);
app.post('/game/:gameId/suspect',turnHandler.suspect);
app.get('/game/:gameId/log/:time',logHandler);
app.get('/game/:gameId/pass',turnHandler.pass);
app.get('/game/:gameId/suspicion', turnHandler.getSuspicion);
app.post('/game/:gameId/ruleout', turnHandler.ruleOut);
app.post('/game/:gameId/accuse',turnHandler.accuse);
app.get('/game/:gameId/accusation',turnHandler.getAccusation);
app.get('/game/:gameId/murderCombination',turnHandler.getMurderCombination);
app.post('/game/:gameId/leave',turnHandler.leave);

app.use(express.static('public'));

module.exports = app;
