var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Schema = mongoose.Schema;

var FixtureSchema = new Schema({
	opposition: { type:String, required: true},
	location: { type: String, required: true}, 
	date: { type: Date, required: true },
	created: { type: Date, default: Date.now },
	organiser: {type: Schema.ObjectId, required: true },
	active: {type: Boolean, default: true},
	team: { type:Schema.ObjectId, required: true }
});

module.exports = mongoose.model('Fixture', FixtureSchema);