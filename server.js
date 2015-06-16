var express = require('express');
var app = express();
var apiRouter = require('./routes.js');


apiRouter(app);


app.listen(3000);
console.log('api is running on port 3000');