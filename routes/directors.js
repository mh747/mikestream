var Director = require('../models/director');
var express = require('express');
var router = express.Router();

router.route('/directors').get(function(req, res) {
	Director.findAll(function(err, directors) {
		if(err) {
			return res.send(err);
		}

		res.json(directors);
	});
});

router.route('/directors/:id').get(function(req, res) {
	Director.findById(req.params.id, function(err, director) {
		if(err) {
			return res.send(err);
		}

		res.json(director);
	});
});

module.exports = router;