var Director = require('../models/director');
var express = require('express');
var router = express.Router();

router.route('/directors').get(function(req, res) {
	res.set({'Content-Type': 'application/json'});
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

	//Get new director object with livestream details
	Director.getNewDirector(req.body.livestream_id, function(err, director) {
		if(err) {
			res.status(err.statusCode);
			return res.send(err.message);
		}

		//Apply other valid fields from req body
		director.favorite_camera = (req.body.favorite_camera) ? req.body.favorite_camera : '';
		director.favorite_movies = (req.body.favorite_movies) ? req.body.favorite_movies : '';

		//Now save
		Director.save(director, function(err, director) {
			if(err) {
				res.status(err.statusCode);
				return res.send(err.message);
			}

			res.json(director);
		});
	});
});

router.route('/directors/:id').put(function(req, res) {
	Director.findById(req.params.id, function(err, director) {
		if(err) {
			res.status(err.statusCode);
			return res.send(err.message);
		}

		//checking authorization header
		var crypto = require('crypto');
		var md5sum = crypto.createHash('md5');
		md5sum.update(director.full_name);
		var hashed = md5sum.digest('hex');
		if(req.header('Authorization') != 'Bearer ' + hashed) {
			console.log('should be: Bearer ' + hashed);
			res.status(403);
			return res.send('Correct authorization key must be sent in header for PUT.');
		}

		if(req.body.favorite_camera) {
			director.favorite_camera = req.body.favorite_camera;
		}
		if(req.body.favorite_movies) {
			director.favorite_movies = req.body.favorite_movies;
		}

		Director.update(director, function(err, modRecord) {
			if(err) {
				res.status(err.statusCode);
				return res.send(err.message);
			}

			res.json(modRecord);
		});
	});
});

module.exports = router;