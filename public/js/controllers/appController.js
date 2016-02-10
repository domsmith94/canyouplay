var canyouplayControllers = angular.module('canyouplayControllers', []);

canyouplayControllers.controller('SettingsController', function($scope, $http, $window) {
	$http({
		method: 'GET',
		url: '/user'
	}).then(function successCallback(response) {
		$scope.firstName = response.data.firstName;
		$scope.lastName = response.data.lastName;


	}, function errorCallback(response) {
		$rootScope.currentUser['loggedIn'] = false;
		alert('Could not find logged in user. Fatal error')

	});




});

canyouplayControllers.controller('FixturesController', function($scope, $http, $window) {


});

canyouplayControllers.controller('StatusController', function($scope, $http, $window) {


});