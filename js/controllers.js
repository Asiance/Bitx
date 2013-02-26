'use strict';

angular
	.module("basecampExtension.controllers", ['ngResource'])

	.controller('TodosController', function($timeout, $scope, $resource, $http, Authorization, User, AssignedTodolists) {

 		/**
		*	After OAuth2 signin, retrieve a Basecamp Account
		*/
		$scope.getBasecampAccount = function() {
            console.log('getBasecampAccount');          
			Authorization.query(function(data) {
                try {
                    $scope.basecampId = data.accounts[0].id;    // Fetch only the 'first' Basecamp Account linked to the user
                    localStorage['basecampId'] = $scope.basecampId;                    
                    $scope.getUser();
                } catch(e) {
                    console.log(e);
                }
            });
		};

		/**
		*	Retrieve ID of the authenticated user inside the Basecamp Account
		*/
		$scope.getUser = function() {
            console.log('getUser');      
	 		User.query({basecampId: $scope.basecampId}, function(data) {
                try {
    				$scope.userId = data.id;
                    localStorage['userId'] = $scope.userId;
                    $scope.getAssignedTodos();
                } catch(e) {
                    console.log(e);
                }
			});
		};		

        /**
        *   Fetch Todolists assigned to the user
        *   and remove the 'Todolist level' to keep only remaining Todos
        */
        $scope.getAssignedTodos = function() {
            console.log('getAssignedTodos');
            AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
                try {
                    $scope.assignedTodos = new Array(); 
                    for (var i = 0; i < data.length; i++) { 
                        for (var j = 0; j < data[i].assigned_todos.length; j++) { 
                            $scope.assignedTodos.push(data[i].assigned_todos[j]);
                        }
                    }                        
                    localStorage['assignedTodos'] = JSON.stringify($scope.assignedTodos);
                } catch(e) {
                    console.log(e);
                }
            });       
            $timeout(pollingTodos, 10000);         
        };

		/**
		*	Custom sort function to compare date in YYYYMMDD format
		*/
		$scope.sortByDate = function(assignedTodo) {
            if (assignedTodo.due_at != null) return assignedTodo.due_at.replace(/-/g, "");
            else return "99999999"; // Default value for undefined due date
		};

        /**
        *   Initialization
        */
        if (!$scope.basecampId) $scope.getBasecampAccount();
        if (localStorage['assignedTodos']) $scope.assignedTodos = JSON.parse(localStorage['assignedTodos']);

        /**
        *   Polling Todos on controller loaded
        */
        function pollingTodos() {
            $scope.getAssignedTodos();  
        }
    
    })

    .controller('TodolistsController', function($scope, $resource, AssignedTodolists) {

        /**
        *   Fetch Todolists (including Todos) assigned to the user
        */
        $scope.getAssignedTodolists = function() {
            AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
                $scope.assignedTodolists = data;
                localStorage['assignedTodolists'] = JSON.stringify($scope.assignedTodolists);            
            });
        };

        /**
        *   Initialization
        */
        $scope.userId = localStorage['userId'];
        $scope.basecampId = localStorage['basecampId'];
        if (localStorage['assignedTodolists']) $scope.assignedTodolists = JSON.parse(localStorage['assignedTodolists']);        
        else $scope.getAssignedTodolists();
    })

    .controller('ProjectsController', function($scope, $resource, Projects) {

        /**
        *   Fetch Projects where the user is involved
        */
        $scope.getProjects = function() {
            Projects.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
                $scope.projects = data;
                localStorage['projects'] = JSON.stringify($scope.projects);            
            });
        };

        /**
        *   Initialization
        */
        if (localStorage['basecampId']) $scope.basecampId = localStorage['basecampId'];
        if (localStorage['projects']) $scope.assignedTodolists = JSON.parse(localStorage['projects']);        
        else $scope.getAssignedTodolists();
    });