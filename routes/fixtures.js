var express = require('express');
var router = express.Router();
var Fixture = require('../models/fixture');

router.post('/', function(req, res){
	var inputData = req.body;

	var newFixture = new Fixture();
	newFixture.opposition = inputData['opposition'];
	newFixture.location = inputData['location'];
	newFixture.date = inputData['date'];
	newFixture.organiser = req.session.user._id;

	newFixture.save(function(err){
		if (err) {
			console.log(err);
			res.send({'success': false});
		} else {
			console.log('Has been saved');
			res.send({'success': true});
		}

	});

});

module.exports = router;