var mongoose = require('mongoose');
var dbConfig = require('../config/db');
var Schema = mongoose.Schema;

mongoose.connect(dbConfig.getMongoURI(), function(err, res){
	if (err) {
		console.log('Couldnt connect to ' + dbConfig.getMongoURI() + err);
	} else {
		console.log('Successfully connected to ' + dbConfig.getMongoURI());
	}
});

var TeamSchema = new Schema({
	team_name: { type:String, required: true},
	web_name: { type: String, required: true, unique: true }, 
	sport: { type: String, required: true },
	owner: { type: Schema.ObjectId, required: true },
	created: {type:Date, default:Date.now}
});

module.exports = mongoose.model('Team', TeamSchema);