var express = require('express');
var app = express();
var apiRouter = require('./routes.js');
/*var bodyParser = require('body-parser');
var router = express.Router();
var apiRouter = require('./routes.js');

app.use(bodyParser.json());


/*router.get('/', function(req, res) {
	res.send('reached mikestream api');
});*/

apiRouter(app);


app.listen(3000);
console.log('api is running on port 3000');