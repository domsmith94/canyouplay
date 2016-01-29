var express = require('express');
var User = require('../models/users');



module.exports = (function(){
	var api = express.Router();

	api.post('/register', function(req, res){
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
									"password": {"type": "string"},
									"password2": {'type': 'string'}
								}
							};

		var result = v.validate(inputData, registerSchema); //result.valid = true if valid

		if(result.valid){
			console.log('JSON sent was valid...');

			var newUser = new User();
			newUser.firstname = inputData['firstName'];
			newUser.lastname = inputData['lastName'];
			newUser.mobile = inputData['mobile'];
			newUser.password = inputData['password'];

			newUser.save(function(err){
				if(err)
					res.send(err);

				console.log('New user has been created and saved to mongodb');
				res.send({'status': 200, 'message': 'New user created'});

			});

		} else {
			console.log('JSON submitted was not valid');
			res.send({'status': 300, 'message': 'Could not create new user'});
		}

		});

		return api;


})();


