var Director = require('../models/director');
var express = require('express');
var router = express.Router();

router.route('/directors').get(function(req, res) {
	Director.findAll(function(err, directors) {
		if(err) {
			res.status(err.statusCode);
			return res.send(err.message);
		}

		res.json(directors);
	});
});

router.route('/directors/:id').get(function(req, res) {
	Director.findById(req.params.id, function(err, director) {
		if(err) {
			res.status(err.statusCode);
			return res.send(err.message);
		}

		res.json(director);
	});
});

router.route('/directors').post(function(req, res) {
	if(!req.body.livestream_id) {
		var err = new Error("Livestream ID is required to create a new account");
		res.status(400);
		return res.send(err.message);
	}

	//Set up new director object and send to Director model
	var director = {
		livestream_id: req.body.livestream_id,
		favorite_camera: (req.body.favorite_camera) ? req.body.favorite_camera : '',
		favorite_movies: (req.body.favorite_movies) ? req.body.favorite_movies : ''
	};
	Director.add(director, function(err, newRecord) {
		if(err) {
			res.status(err.statusCode);
			return res.send(err.message);
		}

		res.json(newRecord);
	});
});

router.route('/directors/:id').put(function(req, res) {
	var director = [];
	if(req.body.favorite_camera) {
		director.favorite_camera = req.body.favorite_camera;
	}
	if(req.body.favorite_movies) {
		director.favorite_movies = req.body.favorite_movies;
	}
	Director.modify(req.params.id, director, function(err, modRecord) {
		if(err) {
			res.status(err.statusCode);
			return res.send(err.message);
		}

		res.json(modRecord);
	});
});

module.exports = router;