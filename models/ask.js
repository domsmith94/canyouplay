var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Schema = mongoose.Schema;

var AskSchema = new Schema({
	fixture: { type: Schema.ObjectId, required: true },
	asked_by: { type: Schema.ObjectId, required: true},
	player: {type: Schema.ObjectId, required: true},
	responded: {type: Boolean, default: false}
	is_playing: {type: Boolean, default: true}, 
	created: {type:Date, default: Date.now}
});

module.exports = mongoose.model('Ask', AskSchema);