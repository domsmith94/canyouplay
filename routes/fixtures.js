var express = require('express');
var router = express.Router();
var Fixture = require('../models/fixture');
var Team = require('../models/team')
var auth = require('../config/auth');
var Validator = require('jsonschema').Validator;


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
	console.log('Trying to get fixture detail for ' + req.params.fixtureId);

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

router.put('/:fixtureId', auth.isAuthenticated, function(req, res){
	console.log("Received a PUT request for fixture " + req.params.fixtureId);

	var v = new Validator();

	var updateFixtureSchema = {"type": "object",
							"properties" : {
								"side" : {
									"type": "string",
									'required': true
								},
								"opposition": {
									"type": "string",
									'required': true
								},
								"location": {
									"type": "string",
									'required': true
								},
								"date": {
									"type": "string",
									'required': true
								},

							}
						};

	var result = v.validate(req.body, updateFixtureSchema); //result.valid = true if valid

	if (result.valid) {
		Fixture.findOne({_id: req.params.fixtureId, team: req.session.user.team}, function(err, fixture){
			if (err) {
				console.log('Could not find fixture ' + req.params.fixtureId + ' in Mongo store');
				res.send({'success': false});
			}

			fixture.side = req.body.side;
			fixture.opposition = req.body.opposition;
			fixture.location = req.body.location;
			fixture.date = req.body.date;

			fixture.save(function(err){
				if (err) {
					console.log('Could not save fixture ' + req.params.fixtureId + ' to Mongo store');
					console.log(err);
				} else {
					console.log('Updated information for fixture ' + req.params.fixtureId + ' in mongo');
					res.send({'success': true});
				}
			});


	});

	} else {
		console.log(req.body);
		res.send({'success': false});
	}
});

module.exports = router;