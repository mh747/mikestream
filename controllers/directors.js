exports.findAll = function(req, res) {
	var model = require('../models/directorsModel.js');
	model.getDirectors(function(response_code, results) {
		res.status(response_code);
		res.json(results);
	});
};

exports.findByLsId = function(req, res) {
	var model = require('../models/directorsModel.js');
	model.getDirectorByLsId(req.params.id, function(response_code,results){
		res.status(response_code);
		res.json(results);
	});
};

exports.add = function(req, res) {
	if(req.body.livestream_id == '' || typeof req.body.livestream_id === 'undefined') {
		res.staus(400);
		res.send("Must POST Livestream ID.");
	} else {
		var model = require('../models/directorsModel.js');
		model.addDirectorByLsId(req.body.livestream_id,
			req.body.favorite_camera, req.body.favorite_movies, 
			function(response_code, results) {
				res.status(response_code);
				res.json(results);
			});
	}
	//var parsed = JSON.parse(req.);

	//res.send("adding user : " + req.body.livestream_id);
};

exports.update = function(req, res) {
	res.send("Update director id: " + req.params.id);
};