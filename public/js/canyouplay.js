var canyouplayApp = angular.module('canyouplayApp', ['ui.bootstrap','ngRoute', 'ngAnimate', 'canyouplayControllers']);

canyouplayApp.run(function($rootScope, $http) {
  $rootScope.currentUser = {}
  $http({
    method: 'GET',
    url: '/user'
  }).then(function successCallback(response) {
    $rootScope.currentUser['loggedIn'] = true;
    $rootScope.currentUser['_id'] = response.data._id;
    $rootScope.currentUser['firstName'] = response.data.firstName;
    $rootScope.currentUser['lastName'] = response.data.lastName;


  }, function errorCallback(response) {
    $rootScope.currentUser['loggedIn'] = false;
    alert('Could not find logged in user. Fatal error')

  });

});

canyouplayApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/settings', {
        templateUrl: 'partials/settings',
        controller: 'SettingsController'
      }).
      when('/fixtures', {
      	templateUrl: '/partials/fixtures',
      	controller: 'FixturesController'
      }).
      when('/status', {
      	templateUrl: '/partials/status',
      	controller: 'StatusController'
      }).
      otherwise({
        redirectTo: '/status'
      });
  }]);


