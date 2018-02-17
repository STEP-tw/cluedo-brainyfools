const express = require('express');
const cookieParser = require('cookie-parser');
const logRequest = require('./src/utils/logger');

const fs = require('fs');

const homePageHandler = require('./src/routes/homePageHandler.js');
const enrollGameHandlers = require('./src/routes/enrollGameHandlers.js');
const waitingPageHandlers = require('./src/routes/waitingPageHandlers.js');
const serveGamePage= require('./src/routes/serveGamePageHandler.js');
const app = express();

app.fs = fs;
app.games = {};
app.idGenerator = ()=>{
  return new Date().getTime();
};

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);

app.get('/game/:gameId', serveGamePage);
app.get('/game/join/:gameId',enrollGameHandlers.serveEnrollingForm);
app.post('/game/join/:gameId',enrollGameHandlers.addPlayerToGame);
app.get('/game/:gameId/wait',waitingPageHandlers.serveWaitingPage);
app.get(['/','/game'],homePageHandler.servePage);
app.post('/game/new',homePageHandler.createGame);
app.post('/game/join',homePageHandler.joinGame);

app.use(express.static('public'));

module.exports = app;
