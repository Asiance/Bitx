'use strict';

angular
  .module('basecampExtension', 
  	['basecampExtension.config', 
  	'basecampExtension.controllers',
  	'basecampExtension.services', 
  	'basecampExtension.filters'])
  
  .config([
    '$routeProvider', '$locationProvider', '$httpProvider', '$resourceProvider', function($routeProvider) {
      $routeProvider
        .when('/', {
          controller: 'TodosController',
          templateUrl: 'views/todos.html'
        })
        .when('/todolists', {
          controller: 'TodolistsController',
          templateUrl: 'views/todolists.html'          
        });
    }
  ]);