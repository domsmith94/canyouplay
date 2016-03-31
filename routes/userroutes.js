var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Team = require('../models/team');
var auth = require('../config/auth');

router.get('/sign-in', function(req, res) {
	res.render('sign-in',
		{title : 'Sign In - CanYouPlay',
		user: req.session.auth});
});

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

router.get('/user/availability', auth.isAuthenticated, function(req, res){

	User.findOne({_id: req.session.user._id}, function(err, result) {
		if (err) {
			res.send({'success': false});
		} else {
			res.send(result.not_avail_on);
		}
	});
});

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