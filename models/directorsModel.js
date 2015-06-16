exports.getDirectors = function(callback) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		connection.query("select * from user", function(err, rows) {
			if(err) {
				throw err;
			} else if(rows.length > 0) {
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
							callback('200', rtnArr);
						}
					});
				}
			} else {
				callback('404', rows);
			}
		});
		connection.release();
	});
};

exports.getDirectorByLsId = function(ls_id, callback) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		connection.query("select * from user where ls_id = ?", ls_id, function(err, rows){
			if(err) {
				throw err;
			} else if(rows.length > 0) {
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

					callback('200',rtn);
				});
			} else {
				//Query returned no results
				callback('404', rows);
			}
		});
		connection.release();
	});
};

exports.addDirectorByLsId = function(ls_id, fave_camera, fave_movies, callback) {
	//First, checking for existing user with ls_id
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		connection.query("select * from user where ls_id = ?", ls_id, function(err, rows) {
			if(err) {
				throw err;
			} else if (rows.length > 0) {
				//Rejecting, user already exists
				var rtn = {message : 'Bad request, user is already a member'};
				callback(400, rtn);
			} else {
				//Look up user on Livestream, and add them here
				var row = {'ls_id' : ls_id};
				if(typeof fave_camera === 'undefined' || fave_camera == '')
					row.favorite_camera = null;
				else
					row.favorite_camera = fave_camera;
				if(typeof fave_movies === 'undefined' || fave_movies == '')
					row.favorite_movies = null;
				else
					row.favorite_movies = fave_movies;

				var rtn;
				getLivestreamDetails(row, function(body, row) {
					var parsed = JSON.parse(body);
					rtn = {
						livestream_id : row.ls_id,
						full_name : parsed.full_name,
						dob : parsed.dob,
						favorite_camera : row.favorite_camera,
						favorite_movies : row.favorite_movies
					}
					//Insert row to db
					var db_row = {
						'ls_id' : row.ls_id,
						favorite_camera : row.favorite_camera,
						favorite_movies : row.favorite_movies
					}
					connection.query("insert into user set ?", db_row, function(err, rows) {
						if(err) {
							throw err;
						}
						else {
							callback('200', rtn);
						}
					});
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


