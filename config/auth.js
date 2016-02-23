var User = require('../models/users');

module.exports = {

	isAuthenticated: function(req, res, next) {
		// Checks to make sure user is logged in. If not redirect to sign-in page
		if (req.session.auth) {
			return next();
		}

		console.log("Request not authenticated. User must be logged in");
		res.redirect('/sign-in');

	},

	isTeamOwner: function(req, res, next) {
		if (req.session.auth) {
			User.findOne({_id: req.session.user._id}, function(err, user){
				if (err) {
					console.log(err);
				} else if (user) {
					if (user.is_owner) {
						console.log("User is owner. Request approved");
						return next();
					} else {
						console.log("User logged in but not team owner. Request denied");
						res.send({'success': false, 'message': 'You must be a team owner to complete that action'});

					}
				}
			});

		} else {
			console.log("Request not authenticated. User should be logged in");
			res.redirect('/sign-in');
		}

	}
};