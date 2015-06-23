var app = require('../app');
var db = require('../data');

app.set('port', 3000);

db.on('connect', function() {
	console.log('Database connected...');
	var server = app.listen(app.get('port'), function() {
		console.log('API running on port ' + server.address().port);
	});
});
