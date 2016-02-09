var canyouplayApp = angular.module('canyouplayApp', ['ngRoute', 'canyouplayControllers']);

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
        redirectTo: '/'
      });
  }]);


