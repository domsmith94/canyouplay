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

canyouplayControllers.controller('FixturesController', function($scope, $http, $window) {


});

canyouplayControllers.controller('AddFixtureController', function($scope, $http, $window) {
	  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };

  $scope.toggleMin();
  $scope.maxDate = new Date(2020, 5, 22);

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
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

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };


});

canyouplayControllers.controller('StatusController', function($scope, $http, $window) {


});