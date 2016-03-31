var mongoose = require('mongoose');
var User = require('./users');
var Team = require('./team');
var Schema = mongoose.Schema;

// Mongoose schema for a Fixture object. Each Fixture belongs to a team. 
// Upon creation, team owner specifies which side is taking part in the fixture.
// Each team can have multiple different 'sides', e.g. 1st XI, 2nd XI etc. This gives
// flexibility to define different aliases for fixtures. Active is false if Fixture is canceled

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