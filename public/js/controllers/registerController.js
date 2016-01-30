myApp.controller('mainController', function($scope, $http, $window) {
	 $scope.submitForm = function(isValid) {

	    // check to make sure the form is completely valid
	    if (isValid) {
			var data = {'email': $scope.email, 
						'firstName': $scope.firstName,
						'lastName': $scope.lastName, 
						'mobile': $scope.mobile,
						'password': $scope.password,
						'password2': $scope.password2}; 

			var res = $http.post('/api/register', data);

			res.success(function(data, status, headers, config) {
				if (data['status'] === 200) {
					//$scope.displayMessage = "We registered that correctly";
					$window.location.href = 'http://' + $window.location.host + '/app';
				} else if (data['status'] == 300) {
					// Server sends back error saying there was a problem registering
					// TODO: Add different messages depending on what the problem was
					// e.g. email address already taken, mobile number already exists
					$scope.displayMessage = "We couldnt register this account";
				}

			});

			res.error(function(data, status, headers, config) {
				alert("The query can't be processed at the moment. Please try again later.");
			});
	    }

  };

});