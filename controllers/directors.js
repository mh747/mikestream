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
	//First, check headers for authorization key
	if(!req.header('Authorization')) {
		//Authorization string not sent in headers
		res.status(403);
		res.send("Must include authorization string in header");
	} else {
		var model = require('../models/directorsModel.js');
		model.updateDirectorByLsId(req.params.id, req.body.favorite_camera,
			req.body.favorite_movies, req.header('Authorization'), 
			function(response_code, results) {
				res.status(response_code);
				res.json(results);
			});
	}
};