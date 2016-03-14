var express = require('express');
var router = express.Router();
var User = require('../models/users');
var auth = require('../config/auth');

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

router.post('/sms-reply', function(req, res){
	console.log(req.body.From);
	console.log(req.body.Body)
	res.send('Got a SMS');
});

module.exports = router;