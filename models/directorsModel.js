exports.getDirectors = function(callback) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		connection.query("select * from user", function(err, rows) {
			if(err) {
				throw err;
			} else {
				//res.json(rows);

				//Getting livestream data for each row
				var index;
				var rtnArr;
				for(index=0; index<rows.length; index++) {
					getLivestreamDetails(rows[index], function(body){
						var parsed = JSON.parse(body);
						console.log(parsed.full_name + '\n' + parsed.dob);;
					});
				}
				callback(rows);
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

function getLivestreamDetails(row, callback) {
	if(row) {
		var request = require('request');
		request({
			uri: "https://api.new.livestream.com/accounts/" + row.ls_id,
			method: "GET",
			timeout: 10000,
			followRedirect: true,
			maxRedirects: 10
		}, function(error, response, body) {
			callback(body);
		});	
	}
}