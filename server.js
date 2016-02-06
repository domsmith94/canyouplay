var express = require('express');
var session = require('express-session');
var dbConfig = require('./config/db');
var app = express();
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false,
  cookie: {maxAge: 3600 * 1000},
  store: new MongoStore({
    url: dbConfig.getMongoURI(),
    //other advanced options
  })
};

mongoose.connect(dbConfig.getMongoURI()); //connect once

var bodyParser = require('body-parser');
var api = require('./routes/api'); // Define and use the API routes
var dashboard = require('./routes/dashboard');
var core = require('./routes/core');
var userroutes = require('./routes/userroutes');

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session(sessionOptions));

//*** Below here is route stuff ***

app.use('/api', api);
app.use('/app', core);
app.use('/dashboard', dashboard);
app.use('/', userroutes);

app.get('/', function(req, res) {

	res.render('index',
		{title : 'CanYouPlay', user: req.session.auth})
});


app.get('/register', function(req, res){
	res.render('register',
		{title: 'Register - CanYouPlay',
			user: req.session.auth});

});

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