exports.findAll = function(req, res) {
	res.send("Retrieve all directors");
};

exports.findById = function(req, res) {
	res.send("Retrieve director id: " + req.params.id);
};

exports.add = function(req, res) {
	res.send("Add new director");
};

exports.update = function(req, res) {
	res.send("Update director id: " + req.params.id);
};