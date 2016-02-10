var canyouplayControllers = angular.module('canyouplayControllers', []);

canyouplayControllers.controller('SettingsController', function($rootScope, $scope, $http, $window) {
	$scope.firstName = $rootScope.currentUser.firstName;
	$scope.lastName = $rootScope.currentUser.lastName;




});

canyouplayControllers.controller('FixturesController', function($scope, $http, $window) {


});

canyouplayControllers.controller('StatusController', function($scope, $http, $window) {


});