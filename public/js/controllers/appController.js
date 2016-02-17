var canyouplayControllers = angular.module('canyouplayControllers', []);

canyouplayControllers.controller('SettingsController', function($scope, $http, $window) {
	$http({
		method: 'GET',
		url: '/user'
	}).then(function successCallback(response) {
		$scope.firstName = response.data.firstName;
		$scope.lastName = response.data.lastName;
		$scope.email = response.data.email;
		$scope.mobile = response.data.mobile;
		$scope.teamName = response.data.teamName;
		$scope.webName = response.data.webName;
		$scope.sport = response.data.sport;
		$scope.teamJoinDate = Date.parse(response.data.teamCreated);
		$scope.joinDate = Date.parse(response.data.joined);
		$scope.owner = response.data.owner;


	}, function errorCallback(response) {
		$rootScope.currentUser['loggedIn'] = false;
		alert('Could not find logged in user. Fatal error')

	});




});

canyouplayControllers.controller('ChangeNameController', function($scope, $http, $window, $location) {
  $scope.submitForm = function(isValid) {
    if (isValid) {
      var data = {'type': 'nameChange', 'firstName': $scope.firstName, 'lastName': $scope.lastName};
      var res = $http.put('/user', data);

      res.success(function(data, status, headers, config){
        if (data['success']) {
          $location.path('/settings');
        }

      });
    }

  };
  
});

canyouplayControllers.controller('ChangeEmailController', function($scope, $http, $window, $location) {
  $scope.submitForm = function(isValid) {
    if (isValid) {
      var data = {'type': 'emailChange', 'email': $scope.email};
      var res = $http.put('/user', data);

      res.success(function(data, status, headers, config){
        if (data['success']) {
          $location.path('/settings');
        }

      });
    }

  };
  
});

canyouplayControllers.controller('ChangeMobileController', function($scope, $http, $window, $location) {
  $scope.submitForm = function(isValid) {
    if (isValid) {
      var data = {'type': 'mobileChange', 'mobile': $scope.mobile};
      var res = $http.put('/user', data);

      res.success(function(data, status, headers, config){
        if (data['success']) {
          $location.path('/settings');
        }

      });
    }

  };
  
});

canyouplayControllers.controller('ChangePasswordController', function($scope, $http, $window, $location) {
  $scope.submitForm = function(isValid) {
    if (isValid) {
      var data = {'type': 'passwordChange', 'currentPassword': $scope.currentPassword,
                  'newPassword': $scope.newPassword, 'confirmPassword': $scope.confirmPassword};
      var res = $http.put('/user', data);

      res.success(function(data, status, headers, config){
        if (data['success']) {
          $location.path('/settings');
        }

      });
    }

  };
  
});

canyouplayControllers.controller('ChangeTeamNameController', function($scope, $http, $window, $location) {
  $scope.submitForm = function(isValid) {
    if (isValid) {
      var data = {'type': 'teamNameChange', 'teamName': $scope.teamName};
      var res = $http.put('/api/team', data);

      res.success(function(data, status, headers, config){
        if (data['success']) {
          $location.path('/settings');
        }

      });
    }

  };
  
});

canyouplayControllers.controller('InviteMemberController', function($scope, $http, $window, $location) {
  $scope.submitForm = function(isValid) {
    if (isValid){
      var data = {'email': $scope.email};
      var res = $http.post('/api/invite', data);

      $location.path('/settings');

    }
  };
});

canyouplayControllers.controller('FixturesController', function($scope, $http, $window) {
  $http({
    method: 'GET',
    url: '/fixtures'
  }).then(function successCallback(response) {
    $scope.teamName = response.data.teamName;
    $scope.fixtures = response.data.fixtures;
  }, function errorCallback(response) {
    //Handle errors here
  });

});

canyouplayControllers.controller('AddFixtureController', function($scope, $http, $window, $location) {
  //Use this API call to see what teams have been input in the past, can prepopulate list
  $http({
    method: 'GET',
    url: '/api/fixtureadd'
  }).then(function successCallback(response) {
    $scope.sides = response.data;
  }, function errorCallback(response) {
    //Handle errors
  });

  $scope.today = function() {
    $scope.dt = new Date();
  };

  $scope.today();

  $scope.maxDate = new Date(2020, 5, 22);

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.submitForm = function(isValid) {
    if (isValid) {
      $scope.dt.setHours($scope.time.getHours());
      $scope.dt.setMinutes($scope.time.getMinutes());
      $scope.dt.setSeconds(0);

      var data = {
        'team': $scope.side,
        'opposition': $scope.opposition,
        'location': $scope.location,
        'date': $scope.dt,
        'side': $scope.side
      };

      var res = $http.post('/fixtures', data);

      res.success(function(data, status, headers, config) {
        if (data['success']) {
          $location.path('/fixtures');
        } else {
          alert('fixtures could not be added');
        }

      });

      res.error(function(data, status, headers, config) {
        alert("The query can't be processed at the moment. Please try again later.");
      });
    }
  };


});

canyouplayControllers.controller('StatusController', function($scope, $http, $window) {


});