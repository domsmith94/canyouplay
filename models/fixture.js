var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var User = require('./users');
var Team = require('./team');
var Schema = mongoose.Schema;

var FixtureSchema = new Schema({
	opposition: { type:String, required: true},
	location: { type: String, required: true}, 
	date: { type: Date, required: true },
	created: { type: Date, default: Date.now },
	organiser: {type: Schema.ObjectId, required: true, ref:'User' },
	active: {type: Boolean, default: true},
	team: { type:Schema.ObjectId, required: true, ref:'Team' },
	side: {type: String, required: true},
});

module.exports = mongoose.model('Fixture', FixtureSchema);