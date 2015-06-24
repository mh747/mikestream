var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3000/mikestream');

describe('GET Requests On Empty Database', function() {
	it('GET to /directors -- Should Return HTTP Status 404 Not Found', function(done) {
		api.get('/directors')
		.set('Accept', 'application/json')
		.expect(404)
		done();
	});

	it('GET to /directors/:id -- Should Return HTTP Status 404 Not Found', function(done) {
		api.get('/directors/6488824')
		.set('Accept', 'application/json')
		.expect(404)
		done();
	});
});

describe('Adding Directors', function() {

//Adding director
	it('POST without camera or movies -- should return new director object with empty camera and movies', function(done) {
		api.post('/directors')
		.set('Accept', 'application/json')
		.send({
			livestream_id: "6488824"
		})
		.expect(200)
		.end(function(err, res) {
			expect(res.body.livestream_id).to.equal('6488824');
			expect(res.body).to.have.property('full_name');
			expect(res.body.full_name).to.not.equal(null);
			expect(res.body).to.have.property('dob');
			expect(res.body.dob).to.not.equal(null);
			expect(res.body).to.have.property('favorite_camera');
			expect(res.body.favorite_camera).to.equal('');
			expect(res.body).to.have.property('favorite_movies');
			expect(res.body.favorite_movies).to.equal('');
			done();
		});
	});

	it('POST with duplicate Livestream ID -- should return error for dupe user', function(done) {
		api.post('/directors')
		.set('Accept', 'application/json')
		.send({
			livestream_id: "6488824"
		})
		.expect(400)
		done();
	});

	it('POST with camera and movies -- should return new director object with non-empty camera and movies', function(done) {
		api.post('/directors')
		.set('Accept', 'application/json')
		.send({
			"livestream_id": "6488818",
			"favorite_camera": "Sony F65",
			"favorite_movies": "Pulp Fiction"
		})
		.expect(200)
		.end(function(err, res) {
			expect(res.body.livestream_id).to.equal('6488818');
			expect(res.body).to.have.property('full_name');
			expect(res.body.full_name).to.not.equal(null);
			expect(res.body).to.have.property('dob');
			expect(res.body.dob).to.not.equal(null);
			expect(res.body).to.have.property('favorite_camera');
			expect(res.body.favorite_camera).to.equal('Sony F65');
			expect(res.body).to.have.property('favorite_movies');
			expect(res.body.favorite_movies).to.equal('Pulp Fiction');
			done();
		});
	});
});

describe('Updating Directors', function() {
	it('PUT Without Auth Header -- Should return 403 Forbidden', function(done) {
		api.put('/directors/6488818')
		.set('Accept', 'application/json')
		.send({
			"favorite_camera": "Nikon",
			"favorite_movies": "Fast and Furious"
		})
		.expect(403)
		done();
	});

	it('PUT With Auth Header -- Should return object with new values', function(done) {
		api.put('/directors/6488818')
		.set('Authorization', 'Bearer 10f607392e9e569848a4f03a8cc206ff')
		.send({
			"favorite_camera": "Nikon",
			"favorite_movies": "Fast and Furious"
		})
		.expect(200)
		.end(function(err, res) {
			expect(res.body.livestream_id).to.equal('6488818');
			expect(res.body).to.have.property('full_name');
			expect(res.body).to.have.property('dob');
			expect(res.body).to.have.property('favorite_camera');
			expect(res.body.favorite_camera).to.equal('Nikon');
			expect(res.body).to.have.property('favorite_movies');
			expect(res.body.favorite_movies).to.equal('Fast and Furious');
			done();
		});
	});
});

describe('Revisting GET Now With Full DB', function() {
	it('GET /directors -- Should return 200', function(done) {
		api.get('/directors')
		.set('Accept', 'application/json')
		expect(200)
		done();
	});

	it('GET /directors/:id -- Should return director object with correct fields', function(done) {
		api.get('/directors/6488818')
		.set('Accept', 'application/json')
		.expect(200)
		.end(function(err, res) {
			expect(res.body).to.have.property('livestream_id');
			expect(res.body.livestream_id).to.equal('6488818');
			expect(res.body).to.have.property('full_name');
			expect(res.body).to.have.property('dob');
			expect(res.body).to.have.property('favorite_camera');
			expect(res.body).to.have.property('favorite_movies');
			done();
		});
	});
});
