var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Team = require('../models/team');
var Fixture = require('../models/fixture');
var Invite = require('../models/invite');
var Ask = require('../models/ask');
var postmarkConfig = require('../config/postmark');
var Validator = require('jsonschema').Validator;
var postmark = require("postmark")(postmarkConfig.postmarkKey());
var auth = require('../config/auth');

router.post('/register', function(req, res){
	// Called in this first stage of registering a new user. We are looking for a JSON from
	// containing properties specified in register schema. 
	console.log(req.body);
	var inputData = req.body;
	var v = new Validator();

	var registerSchema = {"type": "object",
							"properties" : {
								"email" : {
									"type": "string",
									'required': true
								},
								"firstName": {
									"type": "string",
									'required': true
								},
								"lastName": {
									"type": "string",
									'required': true
								},
								"mobile": {
									"type": "string",
									'required': true
								},
								"password": {
									"type": "string",
									'required': true
								},
								"password2": {
									'type': 'string',
									'required': true
								},
								"token": {
									'type': 'string'
								}
							}
						};

	var result = v.validate(inputData, registerSchema); //result.valid = true if valid

	if(result.valid){
		console.log('JSON sent was valid...');

		var newUser = new User();
		newUser.email = inputData['email'];
		newUser.firstname = inputData['firstName'];
		newUser.lastname = inputData['lastName'];
		newUser.mobile = inputData['mobile'];
		newUser.password = inputData['password'];

		// If the request JSON contains a token, try and find the Token in Mongo. 
		if (inputData.token) {
			Invite.findOne({_id: inputData.token}, function(err, invite){
				if (err) {
					console.log("There was a problem accessing the invite from DB");
					console.log(err);
				// If invite has been found and has not been used
				} else if (invite && !invite.used) {
					// Join user who is signing up to the team that invite was created from
					newUser.team = invite.team;
					newUser.member_of_team = true;
					invite.used = true;
					invite.save(function(err){
						if (err){
							console.log(err);
						} else {
							console.log("Invite saved");
						}
					});
				}
			});
		}

		// Check to see if email address already exists in Mongo
		User.find({email: inputData['email'].toLowerCase()}, function(err, results){
			if (results.length) {
				console.log('User with this email address already in database');
				return res.send({'status': 300, 'message': 'An account with that email address already exists'});
			} else {
				newUser.save(function(err){
					if(err) {
						console.log('There was an error');
						console.log(err);
						res.send(err);
					} else {
						req.session.auth = true;
						req.session.user = newUser;
						console.log('New user has been created and saved to mongodb');
						res.send({'status': 200, 'message': 'New user created'});
					}
				});
			}
		});		

	} else {
		console.log('JSON submitted was not valid');
		res.send({'status': 300, 'message': 'Could not create new user'});
	}

});

router.post('/team', function(req, res) {
	console.log(req.body);
	var inputData = req.body;
	var v = new Validator();


	var newTeamSchema = {
		"type": "object",
		"properties": {
			"teamName": {
				"type": "string",
				"required": true
			},
			"webName": {
				"type": "string",
				"required": true
			},
			"sport": {
				"type": "string",
				"required": true
			}
		}
	};

	var result = v.validate(inputData, newTeamSchema);

	if (result.valid) {
		console.log("JSON sent was valid");

		var newTeam = new Team();
		newTeam.team_name = inputData['teamName'];
		newTeam.web_name = inputData['webName'];
		newTeam.sport = inputData['sport'];
		newTeam.owner = req.session.user._id;

		Team.find({web_name: inputData['webName']}, function(err, results){
			if (results.length) {
				console.log('Team name already exists');
				return res.send({'success': false, 'message': 'This web name is already taken!'});
			} else {
				newTeam.save(function(err) {
					if (err) {
						console.log('There was an error');
						console.log(err);
						res.send(err);
					} else {
						req.session.user.member_of_team = true;
						req.session.user.is_owner = true;
						User.findByIdAndUpdate(req.session.user._id, {
							member_of_team: true,
							is_owner: true,
							team: newTeam._id
						}, function(err) {
							if (err) {
								console.log('Could not update user')
							} else {
								console.log('Save user to mongo');
							}
						});

						console.log('Team was saved');
						res.send({'success': true});
					}
				});
			}
		});

	} else {
		console.log('JSON was not valid');
		res.send({'success': false});
	}

});

router.put('/team', auth.isTeamOwner, function(req, res){
	if (req.session.auth){
		var request = req.body;

		switch (request['type']) {
			case 'teamNameChange':
				Team.findOne({_id: req.session.user.team}, function(err, result){
					if (err) {
						console.log("ERROR: Could not find team in db");
						console.log(err);
						res.send({'success': false});
					} else {
						result.team_name = request['teamName'];
						result.save(function(err){
							if (err) {
								console.log(err);
								console.log("Could not change team name");
								res.send({'success': false});
							} else {
								console.log("Updated team name");
								res.send({'success': true});
							}

						});
					}
				});
				break;

			}



	} else {
		console.log("User must be logged in for this action");
	}

});

router.post('/team/join', function(req, res){
	var inputData = req.body;
	var v = new Validator();

	var joinTeamSchema = {
		"type": "object",
		"properties": {
			"webName": {
				"type": "string",
				"required": true
			},
		}
	};

	var result = v.validate(inputData, joinTeamSchema);

	if (result.valid) {
		Team.find({web_name: inputData['webName'].toLowerCase()}, function(err, result) {
			if (result.length) {
				req.session.user.member_of_team = true;
				req.session.user.is_owner = false;
				req.session.user.team = result[0]._id;
				User.findByIdAndUpdate(req.session.user._id, {
					member_of_team: true,
					is_owner: false,
					team: result[0]._id
				}, function(err) {
					if (err) {
						console.log('Could not update user')
					} else {
						console.log('Save user to mongo');
					}
				});

				res.send({'success': true});

			} else {
				console.log('Team does not exist');
				res.send({
					'success': false,
					'message': 'There\'s no team with that web name!'
				});
			}
		});

	} else {
		console.log('JSON was not valid');
		res.send({'success': false});
	}
});


router.post('/invite', auth.isTeamOwner, function(req, res){
	console.log(req.body);
	// Used for creating an invite
	var v = new Validator();

	var inviteSchema = {
		"type": "object",
		"properties": {
			"email": {
				"type": "string",
				"required": true
			},
		}
	};

	var result = v.validate(req.body, inviteSchema);

	if (result.valid) {
		invite = new Invite();
		invite.email = req.body.email;
		invite.invite_by = req.session.user._id;
		invite.team = req.session.user.team;

		invite.save(function(err, invite){
			if (err) {
				console.log("There was an error creating this invite");
				console.log(err);
				res.send({'success': false});
			} else {
				res.send({'success': true});
				console.log(invite);

				postmark.send({
					"From": "ds19g13@soton.ac.uk",
					"To": invite.email,
					"Subject": "Invite to CanYouPlay",
					"TextBody": "You have been invited to join CanYouPlay. Visit http://localhost:3000/register?token=" + invite._id
				}, function(error, success) {
					if (error) {
						console.error("Unable to send via postmark: " + error.message);
						return;
					}
					console.info("Sent to postmark for delivery")
				});
			}
		});

	} else {
		console.log('JSON submitted was not valid');
		res.send({'success': false});
	}
});

router.get('/ask/:fixtureId', function(req, res){
	console.log('GET request for Ask page for fixture ' + req.params.fixtureId);

	// First we try and find the fixture in Mongo based on the URL parameter
	Fixture.findOne({_id: req.params.fixtureId}, function(err, fixture){
		if (err) {
			console.log(err);
			console.log('There was a problem finding this fixture from mongo store');
		}

		if (!fixture) {
			// Fixture specified in URL parameter does not exist, we can't go on any further
			console.log('Could not find fixture ' +  req.params.fixtureId + ' in mongo store');
			return res.send({'success': false});
		}

		// Here we find all users from Mongo who are members of the team
		User.find({team: req.session.user.team}, function(err, results){
			if (err) {
				console.log(err);
				console.log('There was a problem finding players from mongo store');
				return res.send({'success': false});
			} 

			// If the length of this query is 0, something must be wrong and we can't go any further
			if (!results.length) {
				console.log('No players were found with team ID ' + req.session.user.team);
				return res.send({'success': false});
			}

			var availability = {};
			var playersAvail = []; // List of player objects who are available
			var playersNotAvail = []; // List of player objects who are NOT available

			// Iterate through each user and check if they are available on the date of the fixture
			for (var i = 0; i < results.length; i++) {
				// True if player is available on date, otherwise false
				var playerIsAvail = results[i].isAvailOnDate(fixture.date);
				// console.log(playerIsAvail)
				var player = {};
				player['id'] = results[i]._id;
				player['firstName'] = results[i].firstname;
				player['lastName'] = results[i].lastname;
				player['availability'] = playerIsAvail;

				playerIsAvail ? playersAvail.push(player) : playersNotAvail.push(player);
				

			}

			Ask.find({fixture: fixture._id}, function(err, asks){
				if (err) {
					console.log(err);
					console.log('There was a problem finding Asks');
				}

				for (var i = 0; i < asks.length; i++) {
					for(var x = 0; x < playersAvail.length; x++) {
						if (playersAvail[x]['id'].equals(asks[i].player)) {
							// Player has already been asked for this fixture
							console.log('Player already asked');
							playersAvail.splice(x, 1);
						} 
					}
				}

				availability['playersAvail'] = playersAvail;
				availability['playersNotAvail'] = playersNotAvail;
				availability['fixtureId'] = fixture._id;
				availability['opposition'] = fixture.opposition;
				availability['side'] = fixture.side;
				availability['date'] = fixture.date;

				console.log(availability);
				res.send(availability);

			});

		});

	});

});

router.put('/ask', auth.isAuthenticated, function(req, res){
	console.log('User ' + req.session.user._id + ' has replied to an Ask request');

	var v = new Validator();

	var askReplySchema = {
		"type": "object",
		"properties": {
			"askId": {
				"type": "string",
				"required": true
			},
			"reply": {
				"type": "boolean",
				"required": true
			},
		}
	};

	var result = v.validate(req.body, askReplySchema);

	if (result.valid) {
		Ask.findOne({_id: req.body.askId}).
			populate('fixture').
			exec(function(err, ask){
				ask.responded = true;
				ask.is_playing = req.body.reply;
				ask.response_date = Date.now();

				ask.save(function(err){
					if (err) {
						console.log(err);
						res.send({'success': false});
					} else {
						res.send({'success': true});

						// Now we must add the date of fixture to a date that is unavailable for person
						// as they are playing

						User.findOneAndUpdate(
							{_id: req.session.user._id},
							{$addToSet: {not_avail_on: ask.fixture.date}}, 
							{safe: true, upsert: true},
							function(err, model) {
								if (err) {
									console.log(err);
								} else {
									console.log("Updated availability for user " + req.session.user._id);
								}
							}
						);

						// The player has accepted to play on a date. This automatically rejects Asks requests to player
						// for same date...as he cannot play in 2 fixtures on same date
						Ask.find({player: req.session.user._id, fixdate: ask.fixdate, responded: false}, function(err, asks) {
							for (var i = 0; i < asks.length; i++) {
								asks[i].responded = true;
								asks[i].playing = false;
								asks[i].save();
							}
						});


					}
				});
			});


	} else {
		res.send({'success': false});
	}

});

router.post('/ask/:fixtureId', auth.isTeamOwner, function(req, res){
	console.log('Received an ask request for fixture ' + req.params.fixtureId);

	var v = new Validator();

	var askSchema = {
		"type": "object",
		"properties": {
			"playerId": {
				"type": "string",
				"required": true
			},
		}
	};

	var result = v.validate(req.body, askSchema);

	if (result.valid) {
		Fixture.findOne({_id: req.params.fixtureId}, function(err, fixture){
			if (fixture){
				console.log('Fixture does exist in Mongo');
				ask = new Ask();
				ask.fixture = req.params.fixtureId;
				ask.asked_by = req.session.user._id;
				ask.player = req.body.playerId;
				ask.fixdate = fixture.date;
				ask.save(function(err){
					if (err) {
						console.log('Could not save new ask to Mongo');
						res.send({'success': false});
					} else {
						console.log('Ask saved to Mongo');
						res.send({'success': true});
					}
				});
			} else {
				res.send({'success': false});
			}
		});
	} else {
		console.log('JSON submitted was not valid');
		res.send({'success': false});
	}
});

router.get('/info', auth.isAuthenticated, function(req, res){
	console.log('Recieved a info request from ' + req.session.user._id);

	// Get all Asks for this player
	Ask.find({player: req.session.user._id}).
		populate('fixture').
		populate('asked_by').
		exec(function(err, asks){
			// Send 3 seperate arrays, one for responses and ones for fixtures that have been agreed to
			// recRespnses is only sent if user who is logged in is authenticated as team owner
			var responses = [];
			var upcoming = [];
			var recResponses = [];

			// Define what dates are relevant for displaying upcoming fixtures. We don't want to show
			// fixtures that have already taken place. Currently we show fixtures that are upcoming, or
			// were scheduled to start in the last 24 hours of the request
			var relevantDateUpcoming = new Date();
			relevantDateUpcoming.setDate(relevantDateUpcoming.getDate()-1);

			// Process all Asks related to player
			for (var i = 0; i < asks.length; i++) {
				askDict = {};
				var ask = asks[i];
				askDict.opposition = ask.fixture.opposition;
				askDict.side = ask.fixture.side;
				askDict.location = ask.fixture.location;
				askDict.date = ask.fixture.date;
				askDict.askedBy = ask.asked_by.firstname + ' ' + ask.asked_by.lastname;
				askDict.id = ask._id;
				askDict.fixtureId = ask.fixture._id;

				// Push to responses array if player has not responded, upcoming if they have and are playing
				if (!ask.responded) {
					responses.push(askDict);
				} else if (ask.responded && ask.is_playing && (ask.fixture.date > relevantDateUpcoming)) {
					upcoming.push(askDict);
				}
			}

			// If team owner has made request send the latest responses to their invitations
			if (req.session.user.is_owner){
				Ask.find({asked_by: req.session.user._id, responded: true}).
					sort('-response_date').
					limit(10).
					populate('fixture').
					populate('player').
					exec(function(err, more_asks){
						for (var i = 0; i < more_asks.length; i++) {
							askDict = {};
							var ask = more_asks[i];
							askDict.opposition = ask.fixture.opposition;
							askDict.side = ask.fixture.side;
							askDict.location = ask.fixture.location;
							askDict.date = ask.fixture.date;
							askDict.player = ask.player.firstname + ' ' + ask.player.lastname;
							askDict.id = ask._id;
							askDict.fixtureId = ask.fixture._id;
							askDict.isPlaying = ask.is_playing;
							askDict.responseDate = ask.response_date;

							recResponses.push(askDict);
						}

						res.send({'responses': responses, 'upcoming': upcoming, 'recResponses': recResponses});

					});
			} else {
				res.send({'responses': responses, 'upcoming': upcoming, 'recResponses': recResponses});
			}		
	});
});

module.exports = router;