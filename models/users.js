var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;

mongoose.connect(dbConfig.url, function(err, res){
	if (err) {
		console.log('Couldnt connect to ' + dbConfig.url + err);
	} else {
		console.log('Successfully connected to ' + dbConfig.url);
	}
}); //used in local development

var UserSchema = new Schema({
	email: { type: String, required: true, unique: true },
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

// Check password is valid
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


module.exports = mongoose.model('User', UserSchema);