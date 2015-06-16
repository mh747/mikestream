var mysql = require('mysql');
var pool = mysql.createPool({
	host	: "localhost",
	user	: "test",
	password: "test",
	database: "mikestream"
});

module.exports = pool;