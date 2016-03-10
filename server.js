var express = require('express');
var session = require('express-session');
var dbConfig = require('./config/db');
var privateConfig = require('./config/private');
var app = express();
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var twilio = require("twilio")(privateConfig.accountSid, privateConfig.authToken);

var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false,
  cookie: {maxAge: 3600 * 1000 * 24},
  store: new MongoStore({
    url: dbConfig.getMongoURI(),
    //other advanced options
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

//*** Below here is route stuff ***

app.use('/api', api);
app.use('/app', core);
app.use('/', userroutes);
app.use('/fixtures', fixtureroutes);
app.use('/partials', partials);

app.get('/', function(req, res) {

	res.render('index',
		{title : 'CanYouPlay', user: req.session.auth})
});


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

app.get('/status', function(req, res) {
	res.render('status',
		{
			auth: req.session.auth,
			user: req.session.user
		});
});

app.get('/sms', function(req, res){
	twilio.messages.create({
	    body: "Hello from CanYouPlay",
	    to: "447595338249",
	    from: "447481345982"
	}, function(err, message) {
	    process.stdout.write(message.sid);
	});
})


var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');