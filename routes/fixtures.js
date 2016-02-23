var express = require('express');
var router = express.Router();
var Fixture = require('../models/fixture');
var auth = require('../config/auth');

router.post('/', auth.isTeamOwner, function(req, res){
	var inputData = req.body;

	var newFixture = new Fixture();
	newFixture.opposition = inputData['opposition'];
	newFixture.location = inputData['location'];
	newFixture.date = inputData['date'];
	newFixture.side = inputData['side'];
	newFixture.organiser = req.session.user._id;
	newFixture.team = req.session.user.team;

	newFixture.save(function(err){
		if (err) {
			console.log("There was a problem creating the fixture");
			console.log(err);
			res.send({'success': false});
		} else {
			console.log('New fixture has been created');
			res.send({'success': true});
		}

	});

});

router.get('/', auth.isAuthenticated, function(req, res){
	Fixture.find({team: req.session.user.team, active: true}, function(err, results){
		if (err) {
			console.log('There was an error getting the fixtures from Mongo');
		}

		if (results.length){
			console.log('We found some fixtures');
			var resultsToSend = [];

			for(var i = 0; i < results.length; i++) {
				fixture = {};
				fixture['opposition'] = results[i]['opposition'];
				fixture['location'] = results[i]['location'];
				fixture['date'] = results[i]['date'];
				fixture['side'] = results[i]['side'];
				resultsToSend.push(fixture);
			}
			res.send({'fixtures': resultsToSend})
		}

	});

});

module.exports = router;