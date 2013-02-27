'use strict';

angular
	.module("basecampExtension.controllers", ['ngResource'])

	.controller('TodosController', function($timeout, $scope, $resource, $http, $location, Authorization, User, AssignedTodolists) {

 		/**
		*	After OAuth2 signin, retrieve a Basecamp Account
		*/
		$scope.getBasecampAccount = function() {
            console.log('LOG: getBasecampAccount');
            try {      
    			Authorization.query(function(data) {
                    $scope.basecampId = data.accounts[0].id;    // Fetch only the 'first' Basecamp Account linked to the user
                    localStorage['basecampId'] = $scope.basecampId;                    
                    $scope.getUser();
                }, function(response) {
                    console.log('ERROR: Failed to connect!')
                });
            } catch(e) {
                console.log(e);
            }
		};

		/**
		*	Retrieve ID of the authenticated user inside the Basecamp Account
		*/
		$scope.getUser = function() {
            console.log('LOG: getUser');
            try {
    	 		User.query({basecampId: $scope.basecampId}, function(data) {
    				$scope.userId = data.id;
                    localStorage['userId'] = $scope.userId;
                    $scope.getAssignedTodos();
    			}, function(response) {
                    console.log('ERROR: Failed to connect!')
                });
            } catch(e) {
                console.log(e);
            }                
		};		

        /**
        *   Fetch Todolists assigned to the user
        *   and remove the 'Todolist level' to keep only remaining Todos
        */
        $scope.getAssignedTodos = function() {
            console.log('LOG: getAssignedTodos');
            try { 
                AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
                    $scope.assignedTodos = new Array(); 
                    for (var i = 0; i < data.length; i++) { 
                        for (var j = 0; j < data[i].assigned_todos.length; j++) { 
                            $scope.assignedTodos.push(data[i].assigned_todos[j]);
                        }
                    }                        
                    localStorage['assignedTodos'] = JSON.stringify($scope.assignedTodos);
                }, function(response) {
                    console.log('ERROR: Failed to connect!')
                });
                if ($location.absUrl().indexOf('background.html') != -1) $timeout(pollingTodos, 10000); // polling if controller loaded from background.html
            } catch(e) {
                console.log(e);
            }
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
        if (!$scope.basecampId || !localStorage['basecampId'] || !$scope.userId || !localStorage['userId']) $scope.getBasecampAccount();
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
            try {
                AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
                    $scope.assignedTodolists = data;
                    localStorage['assignedTodolists'] = JSON.stringify($scope.assignedTodolists);            
                });
            } catch(e) {
                console.log(e);
            }
        };

        /**
        *   Initialization
        */
        $scope.userId = localStorage['userId'];
        $scope.basecampId = localStorage['basecampId'];
        if (localStorage['assignedTodolists']) $scope.assignedTodolists = JSON.parse(localStorage['assignedTodolists']);        
        $scope.getAssignedTodolists();
    })

    .controller('ProjectsController', function($scope, $resource, Projects) {

        /**
        *   Fetch Projects where the user is involved
        */
        $scope.getProjects = function() {
            try {
                Projects.query({basecampId: $scope.basecampId}, function(data) {
                    $scope.projects = data;
                    localStorage['projects'] = JSON.stringify($scope.projects);            
                });
            } catch(e) {
                console.log(e);
            }
        };

        /**
        *   Initialization
        */
        if (localStorage['basecampId']) $scope.basecampId = localStorage['basecampId'];
        if (localStorage['projects']) $scope.projects = JSON.parse(localStorage['projects']);        
        $scope.getProjects();
    });