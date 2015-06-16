var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var apiRouter = require('./routes.js');

app.use(bodyParser.json());
apiRouter(app);


app.listen(3000);
console.log('api is running on port 3000');