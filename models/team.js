var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
	team_name: { type:String, required: true},
	web_name: { type: String, required: true, unique: true, lowercase: true, trim: true }, 
	sport: { type: String, required: true },
	owner: { type: Schema.ObjectId, required: true },
	created: {type:Date, default:Date.now},
	cancel_period: {type: Number, default: 3}
});

module.exports = mongoose.model('Team', TeamSchema);