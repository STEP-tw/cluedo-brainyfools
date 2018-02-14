const express = require('express');
const cookieParser = require('cookie-parser');

const logRequest = require('./src/utils/logger');

const app = express();
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);


app.use(express.static('public'));
module.exports = app;
