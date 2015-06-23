var Director = {};

Director.findAll = function(callback) {
	//finding all user keys in redis
	var client = require('../data');
	var data = [];

	client.get('next_user_id', function(err, reply) {
		var numRecords = reply - 1;
		var completedReqs = 0;
		console.log('Got next-user-id: ' + numRecords);
		var i;
		
		for(i=1; i<=numRecords; i++) {
			console.log('i = ' + i);
			client.hmget('user:' + i, 'ls_id', 'favorite_camera', 'favorite_movies', function(err, reply) {
				if(err) {
					return callback(err, null);
				}
				var record = {
					ls_id: reply[0],
					full_name: '',
					dob: '',
					favorite_camera: reply[1],
					favorite_movies: reply[2]
				}
				var request = require('request');
				request({
					uri: "https://api.new.livestream.com/accounts/" + reply[0],
					method: "GET",
					timeout: 10000,
					followRedirect: true,
					maxRedirects: 10
				}, function(err, response, body) {
					var parsed = JSON.parse(body);
					record.full_name = parsed.full_name;
					record.dob = parsed.dob;
					data.push(record);
					completedReqs++;

					if(completedReqs === numRecords) 
						return callback(err, data);
				});
				
			});
		}
	});
}

Director.findById = function(id, callback) {
	var client = require('../data');
	
	//Setting up return object
	var data = {
		ls_id: id,
		full_name: '',
		dob: '',
		favorite_camera: '',
		favorite_movies: '' 
	}

	//Now finding local user id for given livestream id
	client.hget('users', id, function(err, reply) {
		if(err) {
			return callback(err, null);
		}
		if(!reply) {
			var error = new Error("User with id:" + id + " does not exist");
			return callback(err, null);
		}
		var dataSources = 2; // Represents number of sources for data (database, livestream api)
		var completedReqs = 0; // Number of finished requests for data
		client.hmget('user:' + reply, 'favorite_camera', 'favorite_movies', function(err, reply) {
			if(err) {
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


module.exports = Director;