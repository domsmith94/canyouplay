var validationApp = angular.module('validationApp', []);

validationApp.controller('mainController', function($scope, $http) {
	 $scope.submitForm = function(isValid) {

    // check to make sure the form is completely valid
    if (isValid) {
		var data = {'email': $scope.email, 
					'firstName': $scope.firstName,
					'lastName': $scope.lastName, 
					'mobile': $scope.mobile,
					'password': $scope.password}; 

		var res = $http.post('/api/register', data);

		res.success(function(data, status, headers, config) {
			alert(data['password']);
		});

		res.error(function(data, status, headers, config) {
			alert("The query can't be processed at the moment. Please try again later.");
		});
    }

  };

});



