var express = require('express');
var router = express.Router();
var Fixture = require('../models/fixture');
var Team = require('../models/team')
var auth = require('../config/auth');
var Validator = require('jsonschema').Validator;
var Ask = require('../models/ask');
var User = require('../models/users');
var privateConfig = require('../config/private');
var accountSid = process.env.accountSid || privateConfig.accountSid;
var authToken = process.env.authToken || privateConfig.authToken;
var twilio = require("twilio")(accountSid, authToken);


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
	Fixture.find({team: req.session.user.team}, function(err, results){
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

	Fixture.findOne({_id: req.params.fixtureId, team: req.session.user.team }).
	populate('organiser').
	exec(function(err, fixture){
		if (err) {
			console.log('Could not find fixture ' + req.params.fixtureId + ' in Mongo store');
			res.send({'success': false});
		}

		Ask.find({fixture: fixture._id}, function(err, results){
			var playersPlaying = [];
			var playersInvited = [];
			var playersDeclined = [];

			function processAsk(i){
				if (i < results.length) {
					var playerInvited = {};

					User.findOne({_id: results[i].player}, function(err, player){
							playerInvited.id = player._id;
							playerInvited.firstName = player.firstname;
							playerInvited.lastName = player.lastname;
							playerInvited.responded = results[i].responded;
							playerInvited.isPlaying = results[i].is_playing;
							playerInvited.askdate = results[i].created;
							playerInvited.askId = results[i]._id;

							if (playerInvited.isPlaying) {
								playersPlaying.push(playerInvited);
							} else if (playerInvited.responded) {
								playersDeclined.push(playerInvited);
							} else {
								playersInvited.push(playerInvited);
							}

							processAsk(i+1);
					});

				} else {
					res.send({
						'id': fixture._id,
						'side': fixture.side,
						'location': fixture.location,
						'opposition': fixture.opposition,
						'active': fixture.active,
						'date': fixture.date,
						'organiser': fixture.organiser.firstname + ' ' + fixture.organiser.lastname,
						'created': fixture.created,
						'invited': playersInvited,
						'playing': playersPlaying,
						'declined': playersDeclined
					});

				}
			}

			processAsk(0);

		});

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

router.patch('/:fixtureId', auth.isTeamOwner, function(req, res){
	console.log('Recieved a request to cancel/uncancel fixture');
	console.log(req.body);

	var v = new Validator();

	var cancelFixtureSchema = {
		"type": "object",
		"properties": {
			"cancel": {
				"type": "boolean",
				"required": true
			},
			"message": {
				"type": "string",
				'required': false
			},
			"sendSMS": {
				"type": "boolean",
				'required': true
			},
		}
	};

	var result = v.validate(req.body, cancelFixtureSchema); //result.valid = true if valid

	if (result.valid) {
		Fixture.findOne({_id: req.params.fixtureId}, function(err, fixture){
			if (err) {
				console.log(err);
				console.log('Could not find fixture in Mongo');
				res.send({'success': false})
			} else {
				fixture.active = !req.body.cancel;
				fixture.save();
				res.send({'success': true})
				if (req.body.sendSMS) {

					Ask.find({fixture: req.params.fixtureId, is_playing: true})
						.populate('player')
						.exec(function(err, asks){
							if (err) {
								console.log('There was a problem');
								console.log(err);
							} else {
								for (var i = 0; i < asks.length; i++) {
									twilio.messages.create({
									    body: req.body.message,
									    to: asks[i].player.mobile,
									    from: "447481345982"
									}, function(err, message) {
									    process.stdout.write(message.sid);
									});
								}
							}

					});
				}
			}
		});


	} else {
		console.log(req.body);
		res.send({'success': false});
	}


});

module.exports = router;