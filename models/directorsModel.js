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
				var completed_requests = 0;
				var total_requests = rows.length;
				var rtnArr = [];
				for(index=0; index<rows.length; index++) {
					getLivestreamDetails(rows[index], function(body, row){
						var parsed = JSON.parse(body);
						rtnArr.push({
							livestream_id : row.ls_id,
							full_name : parsed.full_name,
							dob : parsed.dob,
							favorite_camera : row.favorite_camera,
							favorite_movies : row.favorite_movies 
						});
						completed_requests++;
						if(completed_requests == total_requests) {
							//finished mapping all returned rows
							callback(rtnArr);
						}
					});
				}
				//callback(rows);
			}
		});
		connection.release();
	});
};

exports.getDirectorById = function(id, callback) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		connection.query("select * from user where user_id = ?", id, function(err, rows){
			if(err) {
				throw err;
			} else {
				//Mapping livestream data to record
				var row = rows[0];
				var rtn;
				getLivestreamDetails(row, function(body, row){
					var parsed = JSON.parse(body);
					rtn = {
						livestream_id : row.ls_id,
						full_name : parsed.full_name,
						dob : parsed.dob,
						favorite_camera : row.favorite_camera,
						favorite_movies : row.favorite_movies
					};

					callback(rtn);
				});
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
			callback(body, row);
		});	
	}
}


