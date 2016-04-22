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

// Used when a team owner creates a new fixture. 

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

// Used when a user visits app/fixture (fixture.jade). Returns a list of fixtures and their information
// from the mongo store to the Angular front end

router.get('/', auth.isAuthenticated, function(req, res){
	var date = new Date();
	date.setDate(date.getDate() - 1);

	Fixture.find({team: req.session.user.team, date: {$gt: date}}, function(err, results){
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

// Same as function above but this is for history. Only retrieves fixtures that have now been completed

router.get('/history', auth.isAuthenticated, function(req, res){
	var date = new Date();
	date.setDate(date.getDate() - 1);
	Fixture.find({team: req.session.user.team, date: { $lt: date }}, function(err, results){
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

// Used by fixturedetails.jade. Shows specific information of each fixture and page is tailored to 
// user who is viewing it. 

router.get('/:fixtureId', auth.isAuthenticated, function(req, res) {
	console.log('Trying to get fixture detail for ' + req.params.fixtureId);

	// Find fixture in question using ID supplied in URL
	Fixture.findOne({_id: req.params.fixtureId, team: req.session.user.team }).
	populate('organiser').
	populate('team').
	exec(function(err, fixture){
		if (err) {
			console.log('Could not find fixture ' + req.params.fixtureId + ' in Mongo store');
			res.send({'success': false});
		}

		// Find all Ask requests associated to this fixture. 

		Ask.find({fixture: fixture._id}, function(err, results){
			var playersPlaying = [];
			var playersInvited = [];
			var playersDeclined = [];
			var userInvited = false;
			var userResponded = false;
			var userResponse = false;
			var askId;
			var canCancel = false;

			// Work out if the fixture is allowed to be canceled based on the cancellation period in Team
			// settings
			console.log(fixture.date);
			var todaysDate = Date();
			var cancellationDate = new Date(fixture.date.getTime());
			cancellationDate.setDate(cancellationDate.getDate()-fixture.team.cancel_period);
			console.log(fixture.date);

			if (cancellationDate > todaysDate) {
				canCancel = true;

			} 

			// Use of recursion here is a work around arising from the problem of having callbacks within a for loop
			// in Node.js. For loop executes before the callbacks have called back

			function processAsk(i){
				if (i < results.length) {
					var playerInvited = {};

					if (results[i].player.equals(req.session.user._id)) {
						userInvited = true;
						userResponded = results[i].responded;
						userResponse = results[i].is_playing;
						askId = results[i]._id;

					}

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
					console.log(fixture.date);
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
						'declined': playersDeclined,
						'userInvited': userInvited,
						'userResponded': userResponded,
						'userResponse': userResponse,
						'askId': askId,
						'canCancel': canCancel
					});

				}
			}

			processAsk(0);

		});

	});

});

// Used by editfixture.jade for updating fixtures. 

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

// Used to cancel fixture if user is team owner. Sends SMS message if users have opted
// to receive them 


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
				// If team owner wants to send SMS regarding the cancellation
				if (req.body.sendSMS) {
					// Find all Ask requests where users have responded that they are playing
					Ask.find({fixture: req.params.fixtureId, is_playing: true})
						.populate('player')
						.populate('fixture')
						.exec(function(err, asks){
							if (err) {
								console.log('There was a problem');
								console.log(err);
							} else {
								// Send SMS message to all players that wish to receive them
								for (var i = 0; i < asks.length; i++) {
									if (asks[i].player.sms === true) {
										var message = 'Hi ' + asks[i].player.firstname + 
										'. The fixture you were scheduled to take part in for ' + asks[i].fixture.side + ' against ' 
										+ asks[i].fixture.opposition + ' on ' + asks[i].fixture.date + ' has been canceled. The organiser for the fixture says: ' + req.body.message

										twilio.messages.create({
										    body: message,
										    to: asks[i].player.mobile,
										    from: "447481345982"
										}, function(err, message) {
										    console.log('Sending cancellation message ' + message.sid);
										});
									}

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