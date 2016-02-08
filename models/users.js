var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;


var UserSchema = new Schema({
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	firstname: String,
	lastname: String,
	mobile:String,
	password: { type:String, required: true },
	member_of_team: { type:Boolean, default: false },
	team: {type: Schema.ObjectId },
	is_owner: { type:Boolean, default: false },
	created: {type:Date, default: Date.now }

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