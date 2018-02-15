const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const logRequest = require('./src/utils/logger');
const handler = require('./src/routes/handlers.js');

const app = express();

app.fs = fs;

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);

app.get('/game/join/:id',handler.serveEnrollingForm);

app.use(express.static('public'));
module.exports = app;
