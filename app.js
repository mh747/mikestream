var express = require('express');
var bodyParser = require('body-parser');
var directors = require('./routes/directors');
var app = express();

app.use(bodyParser.json());
app.use('/mikestream', directors);

module.exports = app;