var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Fixture = require('./fixture');
var User = require('./users');
var Schema = mongoose.Schema;

var AskSchema = new Schema({
	fixture: { type: Schema.ObjectId, required: true, ref: 'Fixture'},
	asked_by: { type: Schema.ObjectId, required: true, ref: 'User'},
	player: {type: Schema.ObjectId, required: true, ref: 'User'},
	responded: {type: Boolean, default: false},
	is_playing: {type: Boolean, default: false}, 
	created: {type:Date, default: Date.now}
});

module.exports = mongoose.model('Ask', AskSchema);