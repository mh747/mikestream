var Director = {};

Director.findAll = function(callback) {
	//finding all user keys in redis
	var client = require('../data');
	var data = [];

	client.get('next_user_id', function(err, reply) {
		if(err) {
			err.statusCode = 500;
			return callback(err, null);
		}

		if(!reply) {
			var err = new Error("There are no users in the system");
			err.statusCode = 404;
			return callback(err, null);
		}

		var numRecords = +reply;  //Force type int
		var completedReqs = 0;
		console.log('Got next-user-id: ' + numRecords);
		var i;
		
		for(i=0; i<numRecords; i++) {
			console.log('i = ' + i);
			client.hmget('user:' + i, 'livestream_id', 'favorite_camera', 'favorite_movies', function(err, reply) {
				if(err) {
					err.statusCode = 500;
					return callback(err, null);
				}
				console.log('got data from db');
				var record = {
					livestream_id: reply[0],
					full_name: '',
					dob: '',
					favorite_camera: reply[1],
					favorite_movies: reply[2]
				};
				var request = require('request');
				request({
					uri: "https://api.new.livestream.com/accounts/" + reply[0],
					method: "GET",
					timeout: 10000,
					followRedirect: true,
					maxRedirects: 10
				}, function(err, response, body) {
					if(err) {
						err.statusCode = 500;
						return callback(err, null);
					}
					console.log('got data from livestream');
					var parsed = JSON.parse(body);
					record.full_name = parsed.full_name;
					record.dob = parsed.dob;
					data.push(record);
					completedReqs++;

					if(completedReqs === numRecords) 
						return callback(null, data);
				});
				
			});
		}
	});
}

Director.findById = function(id, callback) {
	var client = require('../data');
	
	//Setting up return object
	var data = {
		livestream_id: id,
		full_name: '',
		dob: '',
		favorite_camera: '',
		favorite_movies: '' 
	};

	//Now finding local user id for given livestream id
	client.hget('users', id, function(err, reply) {
		if(err) {
			err.statusCode = 500;
			return callback(err, null);
		}
		if(!reply) {
			var err = new Error("User with id:" + id + " does not exist");
			err.statusCode = 404;
			return callback(err, null);
		}
		var dataSources = 2; // Represents number of sources for data (database, livestream api)
		var completedReqs = 0; // Number of finished requests for data
		client.hmget('user:' + reply, 'favorite_camera', 'favorite_movies', function(err, reply) {
			if(err) {
				err.statusCode = 500;
				return callback(err, null);
			}
			data.favorite_camera = reply[0];
			data.favorite_movies = reply[1];
			completedReqs++;
			if(completedReqs === dataSources) {     //If all requests are done
				return callback(null, data);
			}
		});

		// Asynchronously running http request to livstream
		var request = require('request');
		request({
			uri: "https://api.new.livestream.com/accounts/" + id,
			method: "GET",
			timeout: 10000,
			followRedirect: true,
			maxRedirects: 10
		}, function(err, response, body) {
			if(err) {
				err.statusCode = 500;
				return callback(err, null);
			}
			var parsed = JSON.parse(body);
			data.full_name = parsed.full_name;
			data.dob = parsed.dob;
			completedReqs++;

			if(completedReqs === dataSources) {
				return callback(null, data);
			}
		});
	});
}

Director.add = function(director, callback) {
	var client = require('../data');
	//First, make sure director isn't already in system
	client.hexists('users', director.livestream_id, function(err, reply) {
		if(err) {
			err.statusCode = 500;
			return callback(err, null);
		}
		if(reply === 1) {
			var err = new Error("Livestream ID is already registered as an account");
			err.statusCode = 400;
			return callback(err, null);
		}

		//Setting up return object
		var data = {
			livestream_id: director.livestream_id,
			full_name: '',
			dob: '',
			favorite_camera: director.favorite_camera,
			favorite_movies: director.favorite_movies
		};

		var dataSources = 2;
		var completedReqs = 0;

		//Database operations and http call to livestream run async
		client.get('next_user_id', function(err, next_user_id) {
			if(err) {
				err.statusCode = 500;
				return callback(err, null);
			}
			if(!next_user_id) {
				next_user_id = 0;
			}
			console.log('entering user ' + next_user_id);
			console.log(director.livestream_id);

			//Lookup user to make sure its valid Livestream ID
			var request = require('request');
			request({
				uri: "https://api.new.livestream.com/accounts/" + director.livestream_id,
				method: "GET",
				timeout: 10000,
				followRedirect: true,
				maxRedirects: 10
			}, function(err, response, body) {
				if(err) {
					err.statusCode = 500;
					return callback(err, null);
				}

				if(response.statusCode !== 200) {
					err = new Error("User ID " + director.livestream_id + " is not a valid user.");
					err.statusCode = 400;
					return callback(err, null);
				}

				//Adding to db and processing http response async
				client.hmset('user:' + next_user_id, 'livestream_id', director.livestream_id, 
				'favorite_camera', director.favorite_camera, 'favorite_movies', director.favorite_movies,
				function(err, reply) {
					if(err) {
						err.statusCode = 500;
						return callback(err, null);
					}

					client.hset('users', director.livestream_id, next_user_id, function(err, reply) {
						if(err) {
							err.statusCode = 500;
							return callback(err, null);
						}

						client.incr('next_user_id', function(err, reply) {
							if(err) {
								err.statusCode = 500;
								return callback(err, null);
							}

							completedReqs++;
							if(completedReqs === dataSources) {
								return callback(null, data);
							}
						});
					});
				});

				var parsed = JSON.parse(body);
				data.full_name = parsed.full_name;
				data.dob = parsed.dob;
				completedReqs++;
				if(completedReqs === dataSources) {
					return callback(null, data);
				}
			});		

		});
	});
}

Director.modify = function(id, fields, callback) {
	var client = require('../data');
	//Using given livestream id to lookup local user record

	client.hget('users', id, function(err, user_id) {
		if(err) {
			err.statusCode = 500;
			return callback(err, null);
		}

		//Updating local user fields, and sending http request to livestream for
		//return value
		var data = {
			livestream_id: id,
			full_name: '',
			dob: '',
			favorite_camera: '',
			favorite_movies: ''
		}

		var dataSources = 2;
		var completedReqs = 0;

		//HTTP request
		var request = require('request');
		request({
			uri: "https://api.new.livestream.com/accounts/" + id,
			method: "GET",
			timeout: 10000,
			followRedirect: true,
			maxRedirects: 10
		}, function(err, response, body) {
			if(err) {
				err.statusCode = 500;
				return callback(err, null);
			}

			var parsed = JSON.parse(body);
			data.full_name = parsed.full_name;
			data.dob = parsed.dob;
			completedReqs++;
			if(completedReqs === dataSources) {
				return callback(null, data);
			}
		});

		client.hmset('user:' + user_id, fields, function(err, reply) {
			if(err) {
				err.statusCode = 500;
				return callback(err, null);
			}

			//Now set the return data to new value
			client.hmget('user:' + user_id, 'favorite_camera', 'favorite_movies', function(err, reply) {
				if(err) {
					err.statusCode = 500;
					return callback(err, null);
				}
				data.favorite_camera = reply[0];
				data.favorite_movies = reply[1];
				completedReqs++;
				if(completedReqs === dataSources) {
					return callback(null, data);
				}
			});
		});
		
	});

}

module.exports = Director;