var express = require('express');
var session = require('express-session');
var app = express();
var MongoStore = require('connect-mongo')(session);

var sessionOptions = {
  secret: "secret",
  resave : true,
  saveUninitialized : false,
  store: new MongoStore({
    url:"mongodb://localhost:27017/canyouplay",
    //other advanced options
  })
};

var bodyParser = require('body-parser');
var api = require('./routes/api'); // Define and use the API routes

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session(sessionOptions));

//*** Below here is route stuff ***

app.use('/api', api);

app.get('/', function(req, res) {

	res.render('index',
		{title : 'CanYouPlay'})
});

app.get('/sign-in', function(req, res) {
	res.render('sign-in',
		{title : 'Sign In - CanYouPlay'});
});

app.post('/sign-in', function(req, res) {
	var success = false;
	var inputData = req.body;
	var Validator = require('jsonschema').Validator;
	var v = new Validator();

	// Provides backend validation for the request 
	var loginSchema = {"type": "object",
							"properties" : {
								"email" : {
									"type" : "string",
									 "disallow" : "null",
									 "required" : true
								},
								"password" :  {
									"type" : "string",
									"disallow" : "null",
									"required" : true
								}
							}
						};

	var result = v.validate(inputData, loginSchema); //result.valid = true if valid

	if (result.valid) {
		console.log("Sign up JSON was correct")
		var User = require('./models/users');

		// Mongoose query to find the user in mongo collection
		User.findOne({ email: inputData['email'] }, function(err, result) {

	  		if (err) throw err;

	  		if (result) {
	  			result.comparePassword(inputData['password'], function(err, isMatch){
	  				if (isMatch) {
	  					console.log('User found');
	  					console.log(result);
	  					req.session.auth = true; // User now logged in
	  					req.session.user = result; // Store user object in session
	  					res.send({'success': true});
	  				} else {
	  					console.log('User found, password not correct');
	  					res.send({'success': false});

	  				}
	  			});
	  		} else {
	  			console.log('No user found');
	  			res.send({'success': false});
	  		}
		});
	} else {
		console.log(success);
		res.send({'success': false});
	}

});

app.get('/register', function(req, res){
	res.render('register',
		{title: 'Register - CanYouPlay'});

})

app.get('/app', function(req, res) {
	if (req.session.auth) {
		res.send('User logged in');
	} else {
		res.send('Not logged in');
	}
})


var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');