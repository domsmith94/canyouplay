var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

mongoose.connect('mongodb://localhost:27017/canyouplay'); //used in local development

var UserSchema = new Schema({
	email: { type: String, required: true },
	firstname: String,
	lastname: String,
	mobile:String,
	password: { type:String, required: true },
	member_of_team: Boolean,
	is_owner: Boolean

});

UserSchema.pre('save', function(next) {
	var user = this;

	// Password hasn't been modified so do nothing
	if (!user.isModified('password')) return next();

	// Generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);

				// override the cleartext password with the hashed one
				user.password = hash;
       			next();
		});
	});
});



module.exports = mongoose.model('User', UserSchema);