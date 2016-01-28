var validationApp = angular.module('validationApp', []);

validationApp.controller('mainController', function($scope) {
	 $scope.submitForm = function(isValid) {

    // check to make sure the form is completely valid
    if (isValid) {
      alert('our form is amazing');
    }

  };

});



