'use strict';

angular
.module("basecampExtension.controllers", ['ngResource'])

/**
 * Controller linked to todos.html
 */
.controller('TodosController', function($scope, $resource, $http, $location, Authorization, User, AssignedTodolists, Todo) {

  /**
   * After OAuth2 signin, retrieve a Basecamp Account
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
   * Retrieve ID of the authenticated user inside the Basecamp Account
   */
  $scope.getUser = function() {
    console.log('LOG: getUser');
    try {
      User.query({basecampId: $scope.basecampId}, function(data) {
        $scope.userId = data.id;
        localStorage['userId'] = data.id;
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
        // Flatten data to get only Todos
        $scope.assignedTodos = [];
        for (var i = 0; i < data.length; i++) { 
          for (var j = 0; j < data[i].assigned_todos.length; j++) { 
            var tmp = data[i].assigned_todos[j];
            tmp.project = data[i].bucket.name;
            tmp.project_id = data[i].bucket.id;
            tmp.todolist = data[i].name;
            $scope.assignedTodos.push(tmp);
          }
        }
        localStorage['assignedTodos'] = JSON.stringify($scope.assignedTodos);
        $scope.groupByProject();
      }, function(response) {
        console.log('ERROR: Failed to connect!')
      });
    } catch(e) {
      console.log(e);
    }
  };

  $scope.groupByProject = function() {
    console.log('LOG: groupByProject');
    $scope.projects = [];
    var projectName = 'NO_PROJECT';
    for (var i = 0; i < $scope.assignedTodos.length; i++) {
      var assignedTodo = $scope.assignedTodos[i];
      if (assignedTodo.project !== projectName) {
        var project = {name: assignedTodo.project, id: assignedTodo.project_id, assignedTodos: []};
        projectName = assignedTodo.project;
        $scope.projects.push(project);
      }
      project.assignedTodos.push(assignedTodo);
    }
    localStorage['assignedTodosByProject'] = JSON.stringify($scope.projects);    
  };

  /**
   * Custom sort function to compare date in YYYYMMDD format
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
   * Open tab to view Todo on bacsecamp.com
   */
  $scope.openTodo = function(projectId, todoId) {
    console.log('LOG: openTodo');
    try { 
      console.log(projectId + " " + todoId);
      chrome.tabs.create({url: "https://basecamp.com/" + $scope.basecampId + "/projects/" + projectId + "/todos/" + todoId});
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Initialization
   */
  if (!$scope.basecampId || !localStorage['basecampId'] || !$scope.userId || !localStorage['userId']) $scope.getBasecampAccount();
  if (localStorage['assignedTodos']) $scope.assignedTodos = JSON.parse(localStorage['assignedTodos']);   
  if (localStorage['assignedTodosByProject']) $scope.projects = JSON.parse(localStorage['assignedTodosByProject']);   
})

/**
 * Controller linked to todolists.html
 */
.controller('TodolistsController', function($scope, $resource, $location, AssignedTodolists) {

  /**
   * Fetch ACTIVE Todolists assigned to the user
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
   * Redirect to edit a chosen todolist
   * Since ng-href is not allowed
   */
  $scope.gotoTodolist = function(projectId, todolistId) {
    try {
      $location.path('/projects/' + projectId + '/todolists/' + todolistId + '/edit').replace();
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

/**
 * Controller linked to edit-todolist.html
 */
.controller('EditTodolistController', function($scope, $resource, $location, $routeParams, Todolist, Accesses) {

  /**
   * Fetch a Todolist
   */
  $scope.getTodolist = function() {
    try {
      Todolist.query({basecampId: $scope.basecampId, projectId: $scope.projectId, todolistId: $scope.todolistId}, function(data) {
        $scope.todolist = data;  
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Fetch list of potential assignees
   */
  $scope.getAssignees = function() {
    try {
      Accesses.query({basecampId: $scope.basecampId, projectId: $scope.projectId}, function(data) {
        $scope.assignees = data;
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Find real name of a User ID
   * ng-model binds only the value when select->option
   */
  $scope.retrieveName = function(userId) {
    try {
      return _.findWhere($scope.assignees, {id: userId}).name;
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Add a Todo
   * @Todo
   */
  $scope.addTodo = function() {
    $scope.newTodos.push({
      content: $scope.contentTodo,
      due_at: $scope.dueatTodo,
      assignee: {
        id: $scope.assigneeIdTodo,
        name: $scope.retrieveName($scope.assigneeIdTodo),
        type: 'Person'
      }
    });
    $scope.contentTodo = '';
    $scope.assigneeTodo = '';
    $scope.dueatTodo = '';
    console.log($scope.newTodos);
  };

  /**
   * Save Todolist and Todos modifications
   * @Todo
   */
  $scope.saveAll = function() {};

  /**
   * Initialization
   */
  $scope.newTodos = [];
  $scope.projectId = $routeParams.projectId;
  $scope.todolistId = $routeParams.todolistId;
  $scope.basecampId = localStorage['basecampId'];
  $scope.getAssignees();
  $scope.getTodolist();

})

/**
 * Controller linked to projects.html
 */
.controller('ProjectsController', function($scope, $resource, Projects, Project, Todolists, CompletedTodolists, Todolist) {

  /**
   * Fetch all Projects where the user is involved
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
   * Fetch details on a Project
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
   * Fetch ACTIVE Todolists of a Project
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
   * Fetch COMPLETED Todolists of a Project
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
        // For each todolists, check the assignee of the remaining todos
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

/**
 * Controller linked to completed-todolists.html
 */
.controller('CompletedTodolistsController', function($scope, Projects, CompletedTodolists) {

  /**
   * Fetch list of Projects
   */
  $scope.getProjects = function(projectId) {
    console.log('LOG: getProjects');
    try {
      var completed_todolists = new Array();      
      Projects.query({basecampId: $scope.basecampId}, function(data) {
        $scope.projects = data;
        localStorage['projects'] = JSON.stringify(data);
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Fetch COMPLETED Todolists of a Project
   */
  $scope.getCompletedTodolists = function(projectId) {
    console.log('LOG: getCompletedTodolists');
    try {
      CompletedTodolists.query({basecampId: $scope.basecampId, projectId: projectId}, function(data) {
        $scope.todolists = data;
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

/**
 * Controller linked to all views
 */
.controller('MainController', function($scope) {

  /**
   * Logout by clearing localStorage
   */
  $scope.logout = function() {
    console.log('LOG: logout');
    localStorage.clear();
    $scope.assignedTodos = [];
    $scope.basecampId = [];
    $scope.userId = [];
    window.close();
  }
  if (localStorage['basecampToken']) $scope.online = true;
});