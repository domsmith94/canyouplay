var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Schema = mongoose.Schema;

var InviteSchema = new Schema({
	team: { type: Schema.ObjectId, required: true },
	invite_by: { type: Schema.ObjectId, required: true},
	email: {type: String, required: true},
	used: {type: Boolean, default: false}, 
	created: {type:Date, expires: 60*60*24}
});

module.exports = mongoose.model('Invite', InviteSchema);