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

					if(completedReqs == numRecords) 
						return callback(err, data);
				});
				
			});
		}
	});
}



module.exports = Director;