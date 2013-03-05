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
        .when('/todolists/completed', {
          controller: 'CompletedTodolistsController',
          templateUrl: 'views/completed-todolists.html'
        })
        .when('/todolists/new', {
          controller: 'NewTodolistController',
          templateUrl: 'views/new-todolist.html'
        })
        .when('/projects/:projectId/todolists/:todolistId/edit', {
          controller: 'EditTodolistController',
          templateUrl: 'views/edit-todolist.html'
        })        
        .when('/projects', {
          controller: 'ProjectsController',
          templateUrl: 'views/projects.html'
        })
        .when('/logout', {
          controller: 'MainController',
          templateUrl: 'views/logout.html'
        })
        .otherwise({redirectTo: '/'});
    }
  ]);