exports.getDirectors = function(req, res) {
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