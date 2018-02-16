const express = require('express');
const cookieParser = require('cookie-parser');
const logRequest = require('./src/utils/logger');

const fs = require('fs');

const homePageHandler = require('./src/routes/homePageHandler.js');
const enrollGameHandlers = require('./src/routes/enrollGameHandlers.js');

const app = express();

app.fs = fs;
app.games = {};

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);

app.get('/game',homePageHandler.servePage);
app.post('/game/new',homePageHandler.createGame);
app.get('/game/join/:id',enrollGameHandlers.serveEnrollingForm);
app.post('/game/join/:id',enrollGameHandlers.sendToWaitingPage);
app.post('/game/join',homePageHandler.joinGame);

app.use(express.static('public'));

module.exports = app;
