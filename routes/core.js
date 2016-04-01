var express = require('express');
var router = express.Router();
var User = require('../models/users');
var auth = require('../config/auth');
var smsHelper = require('../utility/sms');

// Used /app/ URL requests. On root of /app render the core Angular app. 
// If user is not logged in we display the registration page as this is required

router.get('/', auth.isAuthenticated, function(req, res) {
	User.findOne({_id: req.session.user._id}, function(err, user) {
		if (user.member_of_team) {
			res.render('./app/applayout', {
				title: 'CanYouPlay'
			});
		} else {
			res.render('./registration/register2', {
				title: 'Create Or Join Team - CanYouPlay',
				user: user
			});
		}

	});
});

// create-team used in the sign up process if user elects to create new team.
// We handle some cases where a user should not see this page..i.e. they are already
// a member of a team

router.get('/create-team', auth.isAuthenticated, function(req, res){
	User.findOne({_id: req.session.user._id}, function(err, user){
		if (err) {
			console.log(err);
			console.log('Error trying to find user with ID ' + req.session.user._id);
		} else {
			if (user.member_of_team) {
				console.log(req.session.user._id + ' already member of team');
				res.redirect('/app');
			} else {
				res.render('./registration/create-team', {
					title: 'Create Team - CanYouPlay',
					user: req.session.user
				});
			}
		}
	});
});

// Used in sign-up process when user elects to join an existing team. If user already
// member of team do not show this page to them.

router.get('/join-team', auth.isAuthenticated, function(req, res){
	User.findOne({_id: req.session.user._id}, function(err, user){
		if (err) {
			console.log(err);
			console.log('Error trying to find user with ID ' + req.session.user._id);
		} else {
			if (user.member_of_team) {
				console.log(req.session.user._id + ' already member of team');
				res.redirect('/app');
			} else {
				res.render('./registration/join-team', {
					title: 'Join Team - CanYouPlay',
					user: req.session.user
				});
			}
		}
	});

});

// This route is used by Twilio. When a user replies to the SMS number for CanYouPlay
// the message goes to Twilio. Twilio then sends on the message and it's metadata to this URL
// From here, we can process the SMS reply received from user in smsHelper module

router.post('/sms-reply', function(req, res){
	var response = smsHelper.receivedSMS(req.body);
	res.send(response);
	
});

module.exports = router; 