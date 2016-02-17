var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Team = require('../models/team');
var Fixture = require('../models/fixture');
var Invite = require('../models/invite');
var postmarkConfig = require('../config/postmark');
var Validator = require('jsonschema').Validator;
var postmark = require("postmark")(postmarkConfig.postmarkKey());

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

router.put('/team', function(req, res){
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

router.get('/fixtureadd', function(req, res){
	Fixture.find(_id = req.session.user.team).distinct('side', function(err, results) {
		if (err) {
			console.log('There was an error finding distinct side values');
			console.log(err);
		}

		if (results.length > 0){
			res.send(results);
			console.log(results);
		} else {
			res.send([]);
		}		

	});


});

router.post('/invite', function(req, res){
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
					"TextBody": invite._id,
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

module.exports = router;