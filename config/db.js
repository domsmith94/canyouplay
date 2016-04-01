module.exports = {

	// Used to handle running the application locally and on Heroku.

	locaUrl : 'mongodb://localhost:27017/canyouplay',

	getMongoURI: function(){

		var uristring =
    		process.env.MONGOLAB_URI ||
    		process.env.MONGOHQ_URL ||
    		'mongodb://localhost:27017/canyouplay';

    	return uristring;


	}
};
