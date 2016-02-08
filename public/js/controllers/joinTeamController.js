myApp.controller('joinTeamController', function($scope, $http, $window) {
	$scope.submitForm = function(isValid) {

	    // check to make sure the form is completely valid
	    if (isValid) {
			var data = { 'webName': $scope.webName }

			var res = $http.post('/api/team/join', data);

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