var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var api = require('./routes/api'); // Define and use the API routes

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
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
	  					res.send({'success': true});
	  				} else {
	  					console.log('User found, password not correct');
	  				}
	  			});
	  		} else {
	  			console.log('No user found');
	  		}
		});


	} else {
		console.log("Sign up JSON was incorrect")
		res.send({'success' : false});
	}

	


});

app.get('/register', function(req, res){
	res.render('register',
		{title: 'Register - CanYouPlay'});

})


var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');