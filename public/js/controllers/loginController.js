myApp.controller('loginController', function($scope, $http, $window) {
	$scope.submitForm = function(isValid) {

		// Compose JSON to post to server
		var data = {
			'email': $scope.email,
			'password': $scope.password
		};

		var res = $http.post('/sign-in', data);
		// Here we send credentials to back end and wait for response

		res.success(function(data, status, headers, config) {
			if (data.success) {
				$window.location.href = 'http://' + $window.location.host + '/app';
				// If correct eventually we will redirect to app
			} else {
				alert('Credentials incorrect. Not logged in');
				// We will display error message to user
			}
		});

		res.error(function(data, status, headers, config) {
			alert("The query can't be processed at the moment. Please try again later.");
		});

	};

});