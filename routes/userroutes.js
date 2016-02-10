var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Team = require('../models/team');

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

router.get('/user', function(req, res) {
	console.log('This got called');
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
					'joined': result.created,
					'owner': result.is_owner
				});

			})


		});
	}
});

module.exports = router;