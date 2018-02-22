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

const app = express();

app.fs = fs;
app.games = {};
app.idGenerator = () => {
  return new Date().getTime();
};

const setGame = function (req, res, next) {
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  req.game = game;
  next();
};

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);

app.use('/game/:gameId([\\d]+)', redirectToGame, setGame);
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


app.get('/game/:gameId/pass',turnHandler.pass);

app.use(express.static('public'));

module.exports = app;
