var User = require('../models/users');

// Middleware that is used for function level authentication control. isAuthenticated or isTeamOwner 
// is passed as a parameter depending on what is required 

module.exports = {

	// isAuthenticated ensures users are logged in to the application before any request is processed. 
	// If a user is not logged in, they are redirected to the sign in page.

	isAuthenticated: function(req, res, next) {
		if (req.session.auth) {
			return next();
		}

		console.log('Request not authenticated. User must be logged in');
		res.redirect('/sign-in');

	},

	// isTeamOwner checks that a person isAuthenticated and is also the owner of the team that the 
	// request they are making is related to. If they are not the team owner a false JSON response is sent

	isTeamOwner: function(req, res, next) {
		if (req.session.auth) {
			User.findOne({_id: req.session.user._id}, function(err, user){
				if (err) {
					console.log(err);
				} else if (user) {
					if (user.is_owner) {
						console.log('User is owner. Request approved');
						return next();
					} else {
						console.log('User logged in but not team owner. Request denied');
						res.send({"success": false, "message": "You must be a team owner to complete that action"});

					}
				}
			});

		} else {
			console.log('Request not authenticated. User should be logged in');
			res.redirect('/sign-in');
		}

	}
};