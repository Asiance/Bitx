'use strict';

angular
	.module("basecampExtension.controllers", ['ngResource'])

	.controller('TodosController', function($timeout, $scope, $resource, $http, Projects, User, AssignedTodolists) {

 		/**
		*	After OAuth2 signin, retrieve a Basecamp Account
		*/
		$scope.getBasecampAccount = function() {
			Projects.query(function(data) {
                $scope.basecampId = data.accounts[0].id;    // Fetch only the 'first' Basecamp Account linked to the user
                localStorage['basecampId'] = $scope.basecampId;
                $scope.getUser();
            });
		};

		/**
		*	Retrieve ID of the authenticated user inside the Basecamp Account
		*/
		$scope.getUser = function() {
	 		User.query({basecampId: $scope.basecampId}, function(data) {
				$scope.userId = data.id;
                localStorage['userId'] = $scope.userId;
                $scope.getAssignedTodos();
			});
		};		

		/**
		*	Fetch Todolists (including Todos) assigned to the user
		*/
		$scope.getAssignedTodolists = function() {
	 		AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
	 			$scope.assignedTodolists = data;
	 		});
		};

        /**
        *   Fetch Todolists assigned to the user
        *   and remove the 'Todolist level' to keep only remaining Todos
        */
        $scope.getAssignedTodos = function() {
            AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
                $scope.assignedTodos = new Array(); 
                for (var i = 0; i < data.length; i++) { 
                    for (var j = 0; j < data[i].assigned_todos.length; j++) { 
                        $scope.assignedTodos.push(data[i].assigned_todos[j]);
                    }
                }
                localStorage['assignedTodos'] = JSON.stringify($scope.assignedTodos);
            });
        };

		/**
		*	Custom sort function to compare date in YYYYMMDD format
		*/
		$scope.sortByDate = function(assignedTodo) {
            if (assignedTodo.due_at != null) return assignedTodo.due_at.replace(/-/g, "");
            else return "99999999"; // Default value for undefined due date
		};

        $scope.basecampId = (localStorage['basecampId'] != null || localStorage['basecampId'] != undefined) ? localStorage['basecampId'] : $scope.getBasecampAccount();
        $scope.userId = (localStorage['userId'] != null || localStorage['userId'] != undefined) ? localStorage['userId'] : $scope.getUser();
        $scope.assignedTodos = (localStorage['assignedTodos'] != null || localStorage['assignedTodos'] != undefined) ? JSON.parse(localStorage['assignedTodos']) : $scope.getAssignedTodos();

        /**
        *   Polling Todos on controller loaded
        */
        function pollingTodos() {
            $scope.getAssignedTodos();
            $timeout(pollingTodos, 10000);
        } pollingTodos();
    
    });