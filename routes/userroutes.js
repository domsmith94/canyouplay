var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Team = require('../models/team');
var auth = require('../config/auth');

// Displays sign-in page

router.get('/sign-in', function(req, res) {
	res.render('sign-in',
		{title : 'Sign In - CanYouPlay',
		user: req.session.auth});
});

// Handles log in requests & sessions

router.post('/sign-in', function(req, res) {
	var success = false;
	var inputData = req.body;
	var Validator = require('jsonschema').Validator;
	var v = new Validator();

	// Provides backend validation for the request 
	var loginSchema = {"type": "object",
							"properties" : {
								"email" : {
									"type" : "string",
									 "disallow" : "null",
									 "required" : true
								},
								"password" :  {
									"type" : "string",
									"disallow" : "null",
									"required" : true
								}
							}
						};

	var result = v.validate(inputData, loginSchema); //result.valid = true if valid

	if (result.valid) {
		console.log("Sign in JSON was correct")

		// Mongoose query to find the user in mongo collection
		User.findOne({ email: inputData['email'].toLowerCase() }, function(err, result) {

	  		if (err) throw err;

	  		if (result) {
	  			result.comparePassword(inputData['password'], function(err, isMatch){
	  				if (isMatch) {
	  					console.log('User found');
	  					req.session.auth = true; // User now logged in
	  					req.session.user = result; // Store user object in session
	  					console.log(req.session.auth);
	  					res.send({'success': true});
	  				} else {
	  					console.log('User found, password not correct');
	  					res.send({'success': false});

	  				}
	  			});
	  		} else {
	  			console.log('No user found');
	  			res.send({'success': false});
	  		}
		});
	} else {
		console.log(success);
		res.send({'success': false});
	}

});

// Handles sign out requests

router.post('/sign-out', function(req, res){
	if (req.session.auth) {
		console.log('User ' + req.session.user.firstname + " is being logged out");
		req.session.auth = false;
		req.session.user = undefined;
		res.redirect('/');

	} else {
		console.log('Nobody logged in');
		res.send('No body was logged in');
	}

});

// Handles requests for user information

router.get('/user', auth.isAuthenticated, function(req, res) {
	if (req.session.auth) {
		User.findOne({ _id: req.session.user._id }, function(err, result) {
			Team.findOne({_id: result.team}, function(err2, team) {
				res.send({
					'_id': result._id,
					'firstName': result.firstname,
					'lastName': result.lastname,
					'email': result.email,
					'mobile': result.mobile,
					'teamName': team.team_name,
					'webName': team.web_name,
					'sport': team.sport,
					'cancelPeriod': team.cancel_period,
					'teamCreated': team.created,
					'joined': result.created,
					'owner': result.is_owner
				});

			})


		});
	}
});

// Handles updates to user settings. type results in correct setting being changed

router.put('/user', auth.isAuthenticated, function(req, res){
	if (req.session.auth) {
		var request = req.body;

		console.log(request['type']);

		User.findOne({_id: req.session.user._id }, function(err, result){
			switch (request['type']) {
				case "nameChange":
					result.firstname = request['firstName'];
					result.lastname = request['lastName'];
					result.save(function(err){
						if (err) {
							console.log("ERROR: Could not update users name");
							res.send({'success': false});
						} else {
							console.log("User name updated successfully");
							res.send({'success': true})
						}
					});
					break;

				case "emailChange":
					result.email = request['email'];
					result.save(function(err){
						if (err) {
							console.log("ERROR: Could not update email for user");
							console.log(result);
							res.send({'success': false});
						} else {
							console.log("Email address updated successfully");
							res.send({'success': true});
						}
					});
					break;

				case "mobileChange":
					result.mobile = request['mobile'];
					result.save(function(err){
						if (err) {
							console.log("ERROR: Could not update users mobile");
							res.send({'success': false});
						} else {
							console.log("Mobile updated successfully");
							res.send({'success': true})
						}
					});
					break;
				case 'smsChange':
					result.sms = request.receiveSMS;
					result.save(function(err){
						if (err) {
							console.log("ERROR: Could not update users SMS settings");
							res.send({'success': false});
						} else {
							console.log("SMS settings updated successfully");
							res.send({'success': true})
						}
					});
					break;
				case "passwordChange":
					result.comparePassword(request['currentPassword'], function(err, isMatch){
						if (isMatch) {
							console.log('Passwords did match');
							result.password = request['newPassword'];
							result.save(function(err){
								if (err) {
									console.log("ERROR: Could not save new password");
									console.log(err);
									res.send({'success': false});
								} else {
									console.log("Password updated successfully");
									res.send({'success': true})
								}
							});
						} else {
							console.log("ERROR: Password not correct");
							res.send({'success': false});
						}
					});
					break;
			}
		});
	} else {
		console.log('User must be logged in to perform this request');
		res.send({'success': false});
	}

});

// Used in availability page so users can update their availability accordingly 
// Availability is stored in User objects in mongo. Field called not_avail_on is an 
// array of date objects. These are dates that the user has specified they cannot play on
// AND dates that they are playing on. For example say a user receives an invite to play
// on a fixture 3/05/2016. They say yes. The previously empty not_avail_on would then 
// include 3/05/206. This prevents the user being asked to play on this date again as they 
// cannot play in both fixtures

router.put('/user/availability', auth.isAuthenticated, function(req, res) {

	if (req.body.available) {
		User.findOneAndUpdate(
			{_id: req.session.user._id},
			{$addToSet: {not_avail_on: req.body['date']}}, 
			{safe: true, upsert: true},
			function(err, model) {
				if (err) {
					console.log(err);
					res.send({'success': false});	
				} else {
					console.log("Updated availability for user " + req.session.user._id);
					res.send({'success': true});
				}
			}
		);
	} else {
		User.findOneAndUpdate(
			{_id: req.session.user._id},
			{$pull: {not_avail_on: req.body['date']}}, 
			{safe: true},
			function(err, model) {
				if (err) {
					console.log(err);
					res.send({'success': false});	
				} else {
					console.log("Updated availability for user " + req.session.user._id);
					res.send({'success': true});
				}
			}
		);

	}
});

// This returns the currents user availability dates

router.get('/user/availability', auth.isAuthenticated, function(req, res){

	User.findOne({_id: req.session.user._id}, function(err, result) {
		if (err) {
			res.send({'success': false});
		} else {
			res.send(result.not_avail_on);
		}
	});
});

// This returns a current Users SMS settings. 

router.get('/user/smssettings', auth.isAuthenticated, function(req, res){
	User.findOne({_id: req.session.user._id}, function(err, user) {
		if (err){
			console.log(err);
		} else {
			res.send({"receiveSMS": user.sms});
		}
	})
});

module.exports = router;