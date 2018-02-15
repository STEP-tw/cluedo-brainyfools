const express = require('express');
const cookieParser = require('cookie-parser');
const logRequest = require('./src/utils/logger');
const fs = require('fs');
const createGameHandlers = require('./src/routes/createGameHandlers.js');

const app = express();
app.fs = fs;

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);

app.get('/game',createGameHandlers.serveHomepage.bind(app));


app.use(express.static('public'));

module.exports = app;
