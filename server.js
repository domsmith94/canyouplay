var express = require('express');
var app = express();

app.set('view engine', 'jade');
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var api = require('./routes/api'); // Define and use the API routes
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
		res.send({'success' : true});

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