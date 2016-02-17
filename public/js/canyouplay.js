var canyouplayApp = angular.module('canyouplayApp', ['ui.bootstrap','ngRoute', 'ngAnimate', 'canyouplayControllers', 'validation.match']);


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
    $rootScope.teamName = response.data.teamName;

    //TO DO ADD team name to root scope for use in Fixtures page


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
      when('/fixtures/add', {
        templateUrl: '/partials/addfixture',
        controller: 'AddFixtureController'
      }).
      when('/status', {
      	templateUrl: '/partials/status',
      	controller: 'StatusController'
      }).
      when('/settings/changename', {
        templateUrl: '/partials/name',
        controller: 'ChangeNameController'
      }).
      when('/settings/changeemail', {
        templateUrl: '/partials/email',
        controller: 'ChangeEmailController'
      }).
      when('/settings/changemobile', {
        templateUrl: '/partials/mobile',
        controller: 'ChangeMobileController'
      }).
      when('/settings/change-password', {
        templateUrl: '/partials/password',
        controller: 'ChangePasswordController'
      }).
      when('/settings/change-team-name', {
        templateUrl: '/partials/team',
        controller: 'ChangeTeamNameController'
      }).
      when('/invite', {
        templateUrl: '/partials/invite',
        controller: 'InviteMemberController'
      }).
      otherwise({
        redirectTo: '/status'
      });
  }]);


