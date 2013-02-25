'use strict';

var basecampExtension = angular.module('basecampExtension', 
	['basecampExtension.config', 
	'basecampExtension.controllers',
	//'basecampExtension.directives', 
	'basecampExtension.services', 
	'basecampExtension.filters'
	])
.config([
    '$routeProvider', '$locationProvider', '$httpProvider', '$resourceProvider', function($routeProvider) {
      $routeProvider.when('/', {
        controller: 'TodosController',
        templateUrl: 'views/todos_sorted.html'
      });
    }
  ]);