var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	if (req.session.auth) {
		if (req.session.user.is_owner) {
			res.send('User is a member of a team...lets Angular');
		} else {
			res.render('register2', 
				{title: 'Create Or Join Team - CanYouPlay',
					user: req.session.user});
		}
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