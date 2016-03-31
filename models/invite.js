var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Schema = mongoose.Schema;

// Mongoose schema for an Invite object. Invite objects are generated when a team owner
// Invites a player to join their team within the application. Invite objects are persisted
// so when an invited player visits the link in their invite email, back-end can check it's
// validity and then join person to the appropriate team. 

var InviteSchema = new Schema({
	team: { type: Schema.ObjectId, required: true },
	invite_by: { type: Schema.ObjectId, required: true},
	email: {type: String, required: true},
	used: {type: Boolean, default: false}, 
	created: {type:Date, expires: 60*60*24}
});

module.exports = mongoose.model('Invite', InviteSchema);