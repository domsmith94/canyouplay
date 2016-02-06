var express = require('express');
var router = express.Router();
var User = require('../models/users');

router.get('/', function(req, res) {
	if (req.session.auth) {
		User.findOne({_id: req.session.user._id}, function(err, user) {
			if (user.member_of_team) {
				res.send('User is member of a team...lets angular');
			} else {
				res.render('register2', {
					title: 'Create Or Join Team - CanYouPlay',
					user: user
				});
			}

		});
	} else {
		res.redirect('/sign-in');
	}
});

router.get('/create-team', function(req, res){
	res.render('create-team', {
		title: 'Create Team - CanYouPlay',
		user: req.session.user
	});
		

});

router.get('/join-team', function(req, res){


});

module.exports = router;