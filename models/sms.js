var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Fixture = require('./fixture');
var User = require('./users');
var Ask = require('./ask');
var Schema = mongoose.Schema;

var SMSSchema = new Schema({

	ask: { type: Schema.ObjectId, required: true, ref: 'Ask'},
	player: {type: Schema.ObjectId, required: true, ref: 'User'},
	number: {type: String, required: true}
	created: {type:Date, default: Date.now},
	send_date: {type:Date, default: Date.now}
	
});

module.exports = mongoose.model('SMS', SMSSchema);