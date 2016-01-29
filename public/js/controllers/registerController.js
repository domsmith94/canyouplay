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
				if (data['status']===200){
					$window.location.href = 'http://' + $window.location.host + '/app';
				}

			});

			res.error(function(data, status, headers, config) {
				alert("The query can't be processed at the moment. Please try again later.");
			});
	    }

  };

});