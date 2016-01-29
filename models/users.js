var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/canyouplay'); 
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	firstname: String,
	lastname: String,
	mobile:String,
	password: String,
	member_of_team: Boolean,

});

module.exports = mongoose.model('User', UserSchema);