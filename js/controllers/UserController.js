'use strict';

basecampExtension.controller('UserController',
	function UserController($scope, user, $location) {

		$scope.userEmail = user.email;
		$scope.userPassword = user.password;

		$scope.connect = function(userEmail, userPassword) {
			user.email = userEmail;
			user.password = userPassword;
	  };

	});