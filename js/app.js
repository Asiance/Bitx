'use strict';

var basecampExtension = angular.module('basecampExtension', []);

basecampExtension.config(function($routeProvider) {

  $routeProvider.
      when('/', {
        controller: 'UserController',
        templateUrl: 'views/user.html'
      });
});