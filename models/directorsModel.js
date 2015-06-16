exports.getDirectors = function(res) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		connection.query("select * from user", function(err, rows) {
			if(err) {
				throw err;
			} else {
				res.json(rows);
			}
		});
		connection.release();
	});
};

exports.getDirectorById = function(id, res) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		connection.query("select * from user where user_id = ?", id, function(err, rows){
			if(err) {
				throw err;
			} else {
				res.json(rows);
			}
		});
		connection.release();
	});
};