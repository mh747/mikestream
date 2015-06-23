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

module.exports = router;