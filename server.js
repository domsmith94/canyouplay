var express = require('express');
var session = require('express-session');
var dbConfig = require('./config/db');
var app = express();
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

// Configure sessions. Sessions will last 24 hours. 
var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false,
  cookie: {maxAge: 3600 * 1000 * 24},
  store: new MongoStore({
    url: dbConfig.getMongoURI(),
  })
};

mongoose.connect(dbConfig.getMongoURI()); //connect once

var bodyParser = require('body-parser');
var api = require('./routes/api'); // Define and use the API routes
var core = require('./routes/core');
var userroutes = require('./routes/userroutes');
var fixtureroutes = require('./routes/fixtures');
var partials = require('./routes/partials');

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session(sessionOptions));

// Routes are defined here. For example, all /api requests are passed to the API router object
app.use('/api', api);
app.use('/app', core);
app.use('/', userroutes);
app.use('/fixtures', fixtureroutes);
app.use('/partials', partials);

// Displays the static home page
app.get('/', function(req, res) {

	res.render('index',
		{title : 'CanYouPlay', user: req.session.auth})
});

// Displays the app home page if user is authenticated, registration if they are not
app.get('/register', function(req, res){
	if (req.session.auth) {
		console.log('User already logged in');
		res.redirect('/app');
	} else {


	res.render('register',
		{title: 'Register - CanYouPlay',
			user: req.session.auth});
	}
});

// Status page used for debugging
app.get('/status', function(req, res) {
	res.render('status',
		{
			auth: req.session.auth,
			user: req.session.user
		});
});


var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');