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

canyouplayControllers.controller('FixtureDetailController', function($scope, $http, $window, $routeParams) {
  $http({
    method: 'GET',
    url: '/fixtures/' + $routeParams.id
  }).then(function successCallback(response) {
    $scope.fixture = response.data;
    var fixDate = new Date(response.data.date);
    $scope.dt = new Date(fixDate.getFullYear(), fixDate.getMonth(), fixDate.getDate());
    $scope.time = new Date(0,0,0, fixDate.getHours(), fixDate.getMinutes());
  }, function errorCallback(response) {
    //Handle errors here
  });


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

  $scope.formats = ['dd MMMM yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
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
        'side': $scope.fixture.side,
        'opposition': $scope.fixture.opposition,
        'location': $scope.fixture.location,
        'date': $scope.dt
      };

      var res = $http.put('/fixtures/' + $scope.fixture.id, data);

      res.success(function(data, status, headers, config) {
        if (data['success']) {
          $location.path('fixtures');
        } else {
          alert('We could not update the fixture information');
        }

      });

      res.error(function(data, status, headers, config) {
        alert("The query can't be processed at the moment. Please try again later.");
      });


    }
  };



});

canyouplayControllers.controller('AskPlayerController', function($scope, $http, $window, $location, $routeParams) {
  $http({
    method: 'GET',
    url: '/api//ask/' + $routeParams.id
  }).then(function successCallback(response) {
    $scope.availData = response.data;

  }, function errorCallback(response) {
    //Handle errors here
  });

  $scope.askPlayer = function(playerId, item) {
    var data = {'playerId': playerId};
    var res = $http.post('/api/ask/' + $routeParams.id, data);

    res.success(function(data){
      if (data.success) {
        var index = $scope.availData.playersAvail.indexOf(item);
        $scope.availData.playersAvail.splice(index, 1);

      } else {
        alert('There was a problem asking player');
      }

    });
  }


});

canyouplayControllers.controller('AddFixtureController', function($scope, $http, $window, $location) {

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

  $scope.formats = ['dd MMMM yyyy', 'yyyy/MM/dd', 'dd/MM/yyyy', 'shortDate'];
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

canyouplayControllers.controller('AvailabilityController', function($scope, $http, $window, $location) {
  $http({
    method: 'GET',
    url: '/user/availability'
  }).then(function successCallback(response) {

    var dates = [];
    for (i = 0; i < response.data.length; i++) {
      var tempDate = new Date(response.data[i]);
      dates.push(tempDate);
    }

    $scope.userAvailability = dates;

  }, function errorCallback(response) {
    //Handle errors here
  });

  $scope.today = function() {
    $scope.dt = new Date();
  };

  $scope.today();

   $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };

  $scope.toggleMin();

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

  $scope.formats = ['dd MMMM yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.submitForm = function(isValid) {
    if (isValid) {
      $scope.dt.setHours(0);
      $scope.dt.setMinutes(0);
      $scope.dt.setSeconds(0);
      $scope.dt.setMilliseconds(0);

      $scope.userAvailability.push($scope.dt);


      var data = {
        'date': $scope.dt,
        'available': true
      };

      var res = $http.put('/user/availability', data);

      res.success(function(data, status, headers, config) {
        if (data['success']) {
        } else {
          alert('fixtures could not be added');
          $scope.userAvailability.pop();
        }

      });

      res.error(function(data, status, headers, config) {
        alert("The query can't be processed at the moment. Please try again later.");
      });
    }
  };


});

canyouplayControllers.controller('InfoController', function($scope, $http, $window) {
    $http({
    method: 'GET',
    url: '/api/info'
  }).then(function successCallback(response) {
    $scope.info = response.data;


  }, function errorCallback(response) {
  });

  $scope.replyToAsk = function(id, canPlay) {
    var data = {
      'askId': id,
      'reply': canPlay
    };

    var res = $http.put('/api/ask', data);    

  }

});

canyouplayControllers.controller('StatusController', function($scope, $http, $window) {
});
