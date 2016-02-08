myApp.controller('createTeamController', function($scope, $http, $window) {
	 $scope.submitForm = function(isValid) {

	    // check to make sure the form is completely valid
	    if (isValid) {
			var data = {'teamName': $scope.teamName, 
						'webName': $scope.webName,
						'sport': $scope.sport};

			var res = $http.post('/api/team', data);

			res.success(function(data, status, headers, config) {
				if (data['success']) {
					$window.location.href = 'http://' + $window.location.host + '/app';
				} else {
					$scope.problemInfo = data['message'];

				}

			});

			res.error(function(data, status, headers, config) {
				alert("The query can't be processed at the moment. Please try again later.");
			});
	    }

  };

});