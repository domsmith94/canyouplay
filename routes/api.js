var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Validator = require('jsonschema').Validator;

router.post('/register', function(req, res){
	// Called in this first stage of registering a new user. We are looking for a JSON from
	// containing properties specified in register schema. 
	console.log(req.body);
	var inputData = req.body;
	var v = new Validator();

	var registerSchema = {"type": "object",
							"properties" : {
								"email" : {
									"type": "string",
									'required': true
								},
								"firstName": {
									"type": "string",
									'required': true
								},
								"lastName": {
									"type": "string",
									'required': true
								},
								"mobile": {
									"type": "string",
									'required': true
								},
								"password": {
									"type": "string",
									'required': true
								},
								"password2": {
									'type': 'string',
									'required': true
								}
							}
						};

	var result = v.validate(inputData, registerSchema); //result.valid = true if valid

	if(result.valid){
		console.log('JSON sent was valid...');

		var newUser = new User();
		newUser.email = inputData['email'];
		newUser.firstname = inputData['firstName'];
		newUser.lastname = inputData['lastName'];
		newUser.mobile = inputData['mobile'];
		newUser.password = inputData['password'];

		newUser.save(function(err){
			if(err) {
				console.log('There was an error');
				console.log(err);
				res.send(err);
			} else {
				req.session.auth = true;
				req.session.user = newUser;
				console.log('New user has been created and saved to mongodb');
				res.send({'status': 200, 'message': 'New user created'});
			}

		});

	} else {
		console.log('JSON submitted was not valid');
		res.send({'status': 300, 'message': 'Could not create new user'});
	}

});

module.exports = router;


