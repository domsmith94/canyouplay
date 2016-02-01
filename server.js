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

	var signUpSchema = {"type": "object",
							"properties" : {
								"username" : {"type" : "string"},
								"password" :  {"type" : "string"} 
							}
						};

	var result = v.validate(inputData, signUpSchema); //result.valid = true if valid

	if (result.valid) {
		console.log("Sign up JSON was correct")
		// try and log in user 

	} else {
		console.log("Sign up JSON was incorrect")
	}

	


});

app.get('/register', function(req, res){
	res.render('register',
		{title: 'Register - CanYouPlay'});

})


var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');