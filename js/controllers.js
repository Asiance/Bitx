'use strict';

angular
.module("basecampExtension.controllers", ['ngResource'])

.controller('TodosController', function($timeout, $scope, $resource, $http, $location, Authorization, User, AssignedTodolists, Todo) {

  /**
  *	After OAuth2 signin, retrieve a Basecamp Account
  */
  $scope.getBasecampAccount = function() {
    console.log('LOG: getBasecampAccount');
    try {
      Authorization.query(function(data) {
        $scope.basecampId = _.findWhere(data.accounts, {product: "bcx"}).id;
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
  * Fetch Todolists assigned to the user
  * and remove the 'Todolist level' to keep only remaining Todos
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
        console.log($scope.assignedTodos);
      }, function(response) {
        console.log('ERROR: Failed to connect!')
      });
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
  * Check Todo when achieved
  */
  $scope.checkTodo = function(projectId, todoId) {
    console.log('LOG: checkTodo');
    try { 
      Todo.update({basecampId: $scope.basecampId, projectId: projectId, todoId: todoId});
    } catch(e) {
      console.log(e);
    }
  };

  /**
  * Initialization
  */
  if (!$scope.basecampId || !localStorage['basecampId'] || !$scope.userId || !localStorage['userId']) $scope.getBasecampAccount();
  if (localStorage['assignedTodos']) $scope.assignedTodos = JSON.parse(localStorage['assignedTodos']);   
})

.controller('TodolistsController', function($scope, $resource, AssignedTodolists) {

  /**
  * Fetch Todolists (including Todos) assigned to the user
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
  * Initialization
  */
  $scope.userId = localStorage['userId'];
  $scope.basecampId = localStorage['basecampId'];
  if (localStorage['assignedTodolists']) $scope.assignedTodolists = JSON.parse(localStorage['assignedTodolists']);        
  $scope.getAssignedTodolists();
})

.controller('ProjectsController', function($scope, $resource, Projects, Project, Todolists, CompletedTodolists, Todolist) {

  /**
  * Fetch Projects where the user is involved
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
  * Fetch a Project
  */
  $scope.getProject = function(projectId) {
    console.log('LOG: getProject');
    try {
      Project.query({basecampId: $scope.basecampId, projectId: projectId}, function(data) {
        $scope.getTodolists(projectId);
        $scope.getCompletedTodolists(projectId);
          $scope.getPeopleOnTodos(projectId);
          $scope.project = data;
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
  * Fetch Todolists of a Project
  */
  $scope.getTodolists = function(projectId) {
    console.log('LOG: getTodolists');
    try {
      Todolists.query({basecampId: $scope.basecampId, projectId: projectId}, function(data) {
        var completed_count = 0;
        var remaining_count = 0;                    
        $scope.todolists = data;
        _.each($scope.todolists, function(item) {
          completed_count += item.completed_count;
          remaining_count += item.remaining_count;
        });
        $scope.completed_count_ongoing = completed_count;
        $scope.remaining_count_ongoing = remaining_count;
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
  * Fetch completed Todolists of a Project
  */
  $scope.getCompletedTodolists = function(projectId) {
    console.log('LOG: getCompletedTodolists');
    try {
      var completed_count = 0;                
      CompletedTodolists.query({basecampId: $scope.basecampId, projectId: projectId}, function(data) {
        $scope.todolists = data;
        _.each($scope.todolists, function(item) {
          completed_count += item.completed_count;
        });
        $scope.completed_count = completed_count;
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
  * Fetch People working on remaining Todos of a Project
  */
  $scope.getPeopleOnTodos = function(projectId) {
    console.log('LOG: getPeopleOnTodos');
    try {
      var people = [];
      var todos_count = [];
      Todolists.query({basecampId: $scope.basecampId, projectId: projectId}, function(data) {
        $scope.todolists = data;
        _.each($scope.todolists, function(todolist) {
          Todolist.query({basecampId: $scope.basecampId, projectId: projectId, todolistId: todolist.id}, function(data) {
            _.each(data.todos.remaining, function(remaining) {
              if (!_.contains(people, remaining.assignee.name)) {
                people.push(remaining.assignee.name);
                todos_count.push(1);
              } else {
                todos_count[_.indexOf(people, remaining.assignee.name)]++;
              }
            });
            $scope.people = [];
            for(var i in people) {
              $scope.people.push({ 
                "name"          : people[i],
                "todos_count"   : todos_count[i],
              });
            }
          });
        });
      });
    } catch(e) {
      console.log(e);
    }
  };        

  /**
  * Initialization
  */
  if (localStorage['basecampId']) $scope.basecampId = localStorage['basecampId'];
  if (localStorage['projects']) $scope.projects = JSON.parse(localStorage['projects']);
  $scope.getProjects();
})

.controller('MainController', function($scope) {

  $scope.logout = function() {
    console.log('LOG: logout');
    localStorage.clear();
    $scope.assignedTodos = [];
    $scope.basecampId = [];
    $scope.userId = [];
    window.close();            
  }
});