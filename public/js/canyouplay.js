var canyouplayApp = angular.module('canyouplayApp', ['ui.bootstrap','ngRoute', 'ngAnimate', 'canyouplayControllers',
                                    'validation.match']);


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
    $rootScope.currentUser['isOwner'] = response.data.owner;
    $rootScope.teamName = response.data.teamName;
    $rootScope.cancelPeriod = response.data.cancelPeriod;

    //TO DO ADD team name to root scope for use in Fixtures page


  }, function errorCallback(response) {
    $rootScope.currentUser['loggedIn'] = false;
    alert('Could not find logged in user. Fatal error')

  });

});

canyouplayApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/partials/info',
        controller: 'InfoController'
      }).
      when('/settings', {
        templateUrl: 'partials/settings',
        controller: 'SettingsController'
      }).
      when('/fixture', {
      	templateUrl: '/partials/fixtures',
      	controller: 'FixturesController'
      }).
      when('/fixture/history', {
        templateUrl: '/partials/fixtures_past',
        controller: 'FixturesHistoryController'
      }).
      when('/fixture/add', {
        templateUrl: '/partials/addfixture',
        controller: 'AddFixtureController'
      }).
      when('/fixture/:id', {
        templateUrl: '/partials/fixturedetails',
        controller: 'FixtureDetailController'
      }).
      when('/fixture/:id/edit', {
        templateUrl: '/partials/editfixture',
        controller: 'EditFixtureController'
      }).
      when('/fixture/:id/ask', {
        templateUrl: 'partials/ask',
        controller: 'AskPlayerController'
      }).
      when('/fixture/:id/cancel', {
        templateUrl: 'partials/cancel',
        controller: 'CancelController'
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
      when('/settings/sms', {
        templateUrl: 'partials/sms',
        controller: 'ChangeSMSController'
      }).
      when('/settings/change-password', {
        templateUrl: '/partials/password',
        controller: 'ChangePasswordController'
      }).
      when('/settings/change-team-name', {
        templateUrl: '/partials/team',
        controller: 'ChangeTeamNameController'
      }).
      when('/settings/change-cancel', {
        templateUrl: 'partials/cancelsettings',
        controller: 'ChangeCancelPeriodController'
      }).
      when('/invite', {
        templateUrl: '/partials/invite',
        controller: 'InviteMemberController'
      }).
      when('/availability', {
        templateUrl: '/partials/availability',
        controller: 'AvailabilityController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);


