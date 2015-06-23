var Director = require('../models/director');
var express = require('express');
var router = express.Router();

router.route('/directors').get(function(req, res) {
	Director.findAll(function(err, directors) {
		if(err) {
			return res.send(err.message);
		}

		res.json(directors);
	});
});

router.route('/directors/:id').get(function(req, res) {
	Director.findById(req.params.id, function(err, director) {
		if(err) {
			return res.send(err.message);
		}

		res.json(director);
	});
});

router.route('/directors').post(function(req, res) {
	if(!req.body.livestream_id) {
		var err = new Error("Livestream ID is required to create a new account");
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
			return res.send(err.message);
		}

		res.json(newRecord);
	});
});

module.exports = router;