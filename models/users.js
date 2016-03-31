var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;

// User mongoose schema. email field must be unique. Contains details of a user as well as each
// users settings. Most fields self explanatory....
// mobile must be in +44(number) format for SMS to work correctly. Catered for on sign up
// sms - is true if user has indicated they want to receive SMS notifications
// not_avail_on is an array of Dates that the user cannot play on. Generated from user updating
// ...their own availability or agreeing to play on a date.


var UserSchema = new Schema({
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	mobile: { type: String, required: true },
	password: { type:String, required: true },
	member_of_team: { type:Boolean, default: false },
	team: { type: Schema.ObjectId },
	is_owner: { type:Boolean, default: false },
	sms: { type:Boolean, default: false },
	created: {type:Date, default: Date.now },
	not_avail_on: [{type: Date}]

});

// Run every time before a User object is saved to mongo. Handles the encrypting of users passwords
// using bcrypt library and salting. This ensures plain text passwords are not stored anywhere in the
// application. 

UserSchema.pre('save', function(next) {
	var user = this;

	if (!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);

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

UserSchema.methods.isAvailOnDate = function(date) {
	// check user is available on date or not and return true or false
	console.log('Checking ' + this.firstname + ' is avail on date '  + date);
	if (!this.not_avail_on.length) {
		return true;
	} else {
		for (var i = 0; i < this.not_avail_on.length; i++) {
			console.log(this.not_avail_on[i]);
			if ((date.getFullYear() === this.not_avail_on[i].getFullYear()) && (date.getMonth() === this.not_avail_on[i].getMonth()) && (date.getDay() === this.not_avail_on[i].getDay())) {
				return false;
			}
		}
		return true;
	}
};


module.exports = mongoose.model('User', UserSchema);