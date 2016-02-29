var express = require('express');
var router = express.Router();
var Fixture = require('../models/fixture');
var Team = require('../models/team')
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
	console.log(req.session.user.team);

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
				fixture['id'] = results[i]['_id'];
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

router.get('/:fixtureId', auth.isAuthenticated, function(req, res) {
	console.log('Trying to get fixture detail for' + req.params.fixtureId);

	Fixture.findOne({_id: req.params.fixtureId, team: req.session.user.team }, function(err, fixture){
		if (err) {
			console.log('Could not find fixture ' + req.params.fixtureId + ' in Mongo store');
			res.send({'success': false});
		}

		res.send({
			'id': fixture._id,
			'side': fixture.side,
			'location': fixture.location,
			'opposition': fixture.opposition,
			'active': fixture.active,
			'date': fixture.date,
			'created': fixture.created
		})

	});

});

module.exports = router;