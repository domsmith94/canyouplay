var express = require('express');
var session = require('express-session');
var dbConfig = require('./config/db');
var app = express();
var MongoStore = require('connect-mongo')(session);

var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false,
  store: new MongoStore({
    url: dbConfig.getMongoURI(),
    //other advanced options
  })
};

var bodyParser = require('body-parser');
var api = require('./routes/api'); // Define and use the API routes
var dashboard = require('./routes/dashboard');
var userroutes = require('./routes/userroutes');

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session(sessionOptions));

//*** Below here is route stuff ***

app.use('/api', api);
app.use('/dashboard', dashboard);
app.use('/', userroutes);

app.get('/', function(req, res) {

	res.render('index',
		{title : 'CanYouPlay'})
});


app.get('/register', function(req, res){
	res.render('register',
		{title: 'Register - CanYouPlay'});

})

app.get('/app', function(req, res) {
	if (req.session.auth) {
		res.send('User logged in as ' + req.session.user.firstname);
	} else {
		res.send('Not logged in');
	}
})


var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');