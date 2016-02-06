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
	name: { type:String, required: true, unique: true },
	fullname: { type: String, required: true, unique: true }, 
	sport: { type: String, required: true },
	owner: { type: Schema.ObjectId, required: true }
});

module.exports = mongoose.model('Team', TeamSchema);