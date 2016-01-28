var express = require('express');

var app = express();

app.set('view engine', 'jade');


app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function(req, res) {
	res.render('index',
		{title : 'CanYouPlay', message: 'Hello!'})
});

app.get('/register', function(req, res){
	res.render('register');

})

app.post('/api/register', function(req, res){
	// Called in this first stage of registering a new user. We are looking for a JSON from
	// containing properties specified in register schema. 
	console.log(req.body);
	var inputData = req.body;

	var Validator = require('jsonschema').Validator;
	var v = new Validator();

	var registerSchema = {"type": "object",
							"properties" : {
								"email" : {"type": "string"},
								"firstName": {"type": "string"},
								"lastName": {"type": "string"},
								"mobile": {"type": "string"},
								"password": {"type": "string"}
							}
						};

	console.log(v.validate(inputData, registerSchema)); //if its valid lets add the user
	var result = v.validate(inputData, registerSchema); //result.valid = true if valid
	console.log(result.valid)
	res.send(inputData);

});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('canyouplay listening on port 3000');