var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Fixture = require('./fixture');
var User = require('./users');
var Schema = mongoose.Schema;

// Mongoose schema for an Ask object. An Ask is what is produced when a team owner sends
// a request to a player, Asking them if they can play in a specific fixture. An Ask keeps
// track of the state of the Ask in the fields is_playing & responded. If a player responds 
// they can play to (by SMS or on the site) the responded & is_playingfield becomes true

var AskSchema = new Schema({
	fixture: { type: Schema.ObjectId, required: true, ref: 'Fixture'},
	asked_by: { type: Schema.ObjectId, required: true, ref: 'User'},
	player: {type: Schema.ObjectId, required: true, ref: 'User'},
	responded: {type: Boolean, default: false},
	is_playing: {type: Boolean, default: false}, 
	created: {type:Date, default: Date.now},
	fixdate: {type:Date, required: true},
	response_date: {type:Date}
});

module.exports = mongoose.model('Ask', AskSchema);