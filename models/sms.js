var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var User = require('./users');
var Ask = require('./ask');
var Schema = mongoose.Schema;

// SMS object mongoose schema. When a team owner asks a player to play in a fixture, and 
// the player being asked has opted to receive SMS notifications and SMS object is generated.
// These are required to enable the functionality of users being able to reply to SMS messages
// with YES/NO and the application to reflect their decision. Mobile number is used to track 
// users replies and must be unique. This means players can only ever respond to the most recent
// SMS ask. Future versions could work on this limitation. 

var SMSSchema = new Schema({

	ask: { type: Schema.ObjectId, required: true, ref: 'Ask'},
	mobile: {type: String, required: true, unique: true},
	send_date: {type:Date, default: Date.now}

});

module.exports = mongoose.model('SMS', SMSSchema);