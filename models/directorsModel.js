exports.getDirectors = function(callback) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		if(err) {
			throw err;
			callback('500', {message: 'Could not connect to database'});
		} else {
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
		}
	});
};

exports.getDirectorByLsId = function(ls_id, callback) {
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		if(err) {
			throw err;
			callback('500', {message: 'Could not connect to database'});
		} else {
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
		}
	});
};

exports.addDirectorByLsId = function(ls_id, fave_camera, fave_movies, callback) {
	//First, checking for existing user with ls_id
	var connPool = require('../database/db.js');

	connPool.getConnection(function(err, connection) {
		if(err) {
			throw err;
			callback('500', {message: 'Could not connect to database'});
		} else {
			connection.query("select * from user where ls_id = ?", ls_id, function(err, rows) {
				if(err) {
					callback('500', {message: 'Error while querying database.'});
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
		}
	});
};

exports.updateDirectorByLsId = function(ls_id, fave_camera, fave_movies, auth_key, callback) {
	/*First step -- 
		check that ls_id exists in our system
	*/
	var connPool = require('../database/db.js');
	connPool.getConnection(function(err, connection) {
		if(err) {
			throw err;
			callback('500', {message: 'Could not connect to database'});
		} else {
			connection.query("select * from user where ls_id = ?", ls_id, function(err, rows) {
				if(err) {
					throw err;
				} else if(rows.length == 0) {
					var rtn = {message: "User not found."};
					callback('404', rtn);
				} else {
					//Found record. Now get livestream details for auth
					getLivestreamDetails(rows[0], function(body, row) {
						var parsed = JSON.parse(body);
						var crypto = require('crypto');
						var md5sum = crypto.createHash('md5');
						md5sum.update(parsed.full_name);
						var hashed = md5sum.digest('hex');

						if('Bearer ' + hashed == auth_key) {

							//Now, we update favorite camera and favorite movies, if they were passed in
							var sql = "update user set ";
							var changing = 0;
							if(typeof fave_camera !== 'undefined') {
								sql += "favorite_camera = " + connection.escape(fave_camera) + " ";
								changing++;
							}
							if(typeof fave_movies !== 'undefined') {
								if(changing > 0)
									sql += ", ";
								sql += "favorite_movies = " + connection.escape(fave_movies) + " ";
								changing++;
							}
							if(changing > 0) {
								sql += "where ls_id = " + connection.escape(ls_id);
								var query = connection.query(sql, function(err, rows) {
									if(err) {
										console.log(query.sql);
										throw err;
									} else {
										rtn = {
											livestream_id: ls_id,
											full_name: parsed.full_name,
											dob: parsed.dob,
											favorite_camera: fave_camera,
											favorite_movies: fave_movies
										}
										callback('200', rtn);
									}
								});
							} else {
								//no fields provided
								callback('400', {message: "No fields provided for change"});
							}
						} else {
							var rtn = {message: "Incorrect auth key provided in header"};
							callback('401', rtn);
						}
					});
				}
			});
			connection.release();
		}
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


