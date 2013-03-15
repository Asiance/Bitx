'use strict';

angular
.module("basecampExtension.controllers", ['ngResource'])

/**
 * Controller linked to todos.html
 */
.controller('TodosController', function($scope, $filter, $resource, $http, $location, $timeout, Authorization, User, AssignedTodolists, Todo) {

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

  /**
   * Group assigned Todos by Project
   */
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
    $scope.displayCategory();
  };

  /**
   * Custom sort function to compare date in YYYYMMDD format
   */
  $scope.sortByDate = function(assignedTodo) {
    if (assignedTodo.due_at != null) return assignedTodo.due_at.replace(/-/g, "");
    else return "99999999"; // Default value for undefined due date
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
   * Check a Todo
   */
  $scope.completeTodo = function(projectId, todoId) {
    console.log('LOG: completeTodo ' + projectId + ' ' + todoId);
    try { 
      Todo.update({basecampId: $scope.basecampId, projectId: 0, todoId: 0});
      $scope.getAssignedTodos();
    } catch(e) {
      console.log(e);
    }
  };

  $scope.displayCategory = function() {
    console.log('LOG: displayCategory');
    try {
      var status = $filter('status');
      if (status($scope.assignedTodos, 1).length > 0) {
        $scope.overdue = "active_overdues";
        $('#overdue_content').slideDown();
      }
      else if (status($scope.assignedTodos, 2).length > 0) {
        $scope.today = "active";
        $('#today_content').slideDown();
      }
      else if (status($scope.assignedTodos, 3).length > 0) {
        $scope.upcoming = "active";
        $('#upcoming_content').slideDown();
      }
      else if (status($scope.assignedTodos, 4).length > 0) {
        $scope.no_due_date = "active";
        $('#no_due_date_content').slideDown();
      }
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * Initialization
   */
  if (localStorage['basecampId'] || localStorage['userId']) {
    $scope.basecampId = localStorage['basecampId'];
    $scope.userId = localStorage['userId'];
  } else $scope.getBasecampAccount();
  if (localStorage['assignedTodos']) {
    $scope.assignedTodos = JSON.parse(localStorage['assignedTodos']);
  }
  if (localStorage['assignedTodosByProject']) {
    $scope.projects = JSON.parse(localStorage['assignedTodosByProject']);
  }
  $scope.displayCategory();  
  $scope.getAssignedTodos(); // In any case, trigger a refresh on open 
  
  /**
   * Execute JS scripts
   */
  $('.todos > dd').slideUp();
  $('.todos > dt > a').click(function() {
    if ($(this).parent().hasClass('active')) {
      $(this).parent().next().slideUp();
      $(this).parent().removeClass('active');
    }
    else {
      $('.todos > dt').removeClass('active');
      $('.todos > dd').slideUp();
      $(this).parent().next().slideDown();
      $(this).parent().addClass('active');
      return false;
    }
  });
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