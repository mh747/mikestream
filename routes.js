module.exports = function(app) {
	var directors = require('./controllers/directors');
	app.get('/mikestream/directors', directors.findAll);
	app.get('/mikestream/directors/:id', directors.findByLsId);
	app.post('/mikestream/directors', directors.add);
	app.put('/mikestream/directors/:id', directors.update);
}