var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Schema = mongoose.Schema;

// Team object mongoose schema. Persists teams in Mongo and keeps track of some team settings
// such as cancel_period. cancel_period refers to the time period before a fixture is to be played
// that a player can pull out of. web-name refers to a URL friendly name that can be used by players
// on sign up. 

var TeamSchema = new Schema({
	team_name: { type:String, required: true},
	web_name: { type: String, required: true, unique: true, lowercase: true, trim: true }, 
	sport: { type: String, required: true },
	owner: { type: Schema.ObjectId, required: true },
	created: {type:Date, default:Date.now},
	cancel_period: {type: Number, default: 3}
});

module.exports = mongoose.model('Team', TeamSchema);