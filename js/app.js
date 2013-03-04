'use strict';

angular
  .module('basecampExtension', 
  	['basecampExtension.controllers',
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
        })
        .when('/projects', {
          controller: 'ProjectsController',
          templateUrl: 'views/projects.html'
        })
        .when('/todolists/completed', {
          controller: 'CompletedTodolistsController',
          templateUrl: 'views/completed-todolists.html'
        })
        .when('/logout', {
          controller: 'MainController',
          templateUrl: 'views/logout.html'
        });
    }
  ]);