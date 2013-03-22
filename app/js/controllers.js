'use strict';

angular
.module("basecampExtension.controllers", ['ngResource'])

/**
 * Controller linked to todos.html
 */
.controller('TodosController', function($scope, $filter, $resource, $http, $location, Authorization, User, AssignedTodolists, Todo) {

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
      $http.put(
        'https://basecamp.com/'+$scope.basecampId+'/api/v1/projects/'+projectId+'/todos/'+todoId+'.json', 
        {completed:true},
        {headers: {'Authorization':'Bearer ' + localStorage['basecampToken']}}
      );
      $scope.getAssignedTodos();
      $( "#" + todoId.toString()).addClass('disappear');
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Set the right class (with ng-class) et display (using jQuery) only one category on launch
   */
  $scope.displayCategory = function() {
    console.log('LOG: displayCategory');
    try {
      // If no category is active, display the first which is not empty
      var counter_todos = localStorage['counter_todos'] ? localStorage['counter_todos'] : "default";      
      if (!$scope.overdue && !$scope.today && !$scope.upcoming && !$scope.no_due_date) {
        var status = $filter('status');
        if (counter_todos == 'overdues' || 
          (counter_todos == 'default' && status($scope.assignedTodos, 1).length > 0)) {
          $scope.overdue = "active active_overdues";
          $('#overdue_content').css("display", "block");
        }
        else if (counter_todos == 'today' || 
          (counter_todos == 'default' && status($scope.assignedTodos, 2).length > 0)) {
          $scope.today = "active";
          $('#today_content').css("display", "block");
        }
        else if (counter_todos == 'upcoming' || 
          (counter_todos == 'default' && status($scope.assignedTodos, 3).length > 0)) {
          $scope.upcoming = "active";
          $('#upcoming_content').css("display", "block");
        }
        else if (counter_todos == 'no_due_date' || 
          (counter_todos == 'default' && status($scope.assignedTodos, 4).length > 0)) {
          $scope.no_due_date = "active";
          $('#no_due_date_content').css("display", "block");
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * Display every category and highlight the found string amoung todos (using jQuery)
   * Event triggered by AngularJS
   */
  $scope.$watch('search', function() {
    if ($scope.search) {
      console.log($scope.search);
      $('.todos > dd').css("display", "block");
      $('.todos > dt').addClass("active");
      $(".todo-text").each(function(i, v) {
      var block = $(v);
      block.html(
        block.text().replace(
          new RegExp($scope.search, "gi"), function(match) {
            return ["<span class='highlight'>", match, "</span>"].join("");
        }));
      });
    } else if ($scope.search == "") {
      $('.todos > dd').css("display", "none");
      $('.todos > dt').removeClass("active");
    }
  });

  /**
   * Initialization of variables
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
  $scope.test="$";
  /**
   * Initialization of i18n
   */
  document.getElementById("search-input").placeholder = chrome.i18n.getMessage("searchTodo");

  document.getElementById("header_overdues").innerHTML = chrome.i18n.getMessage("header_overdues");
  document.getElementById("header_today").innerHTML = chrome.i18n.getMessage("header_today");
  document.getElementById("header_upcoming").innerHTML = chrome.i18n.getMessage("header_upcoming");
  document.getElementById("header_noduedate").innerHTML = chrome.i18n.getMessage("header_noduedate");

  $scope.addedDate = chrome.i18n.getMessage("addedDate");

  $scope.dayLate = chrome.i18n.getMessage("dayLate");
  $scope.daysLate = chrome.i18n.getMessage("daysLate");

  $scope.dayLeft = chrome.i18n.getMessage("dayLeft");
  $scope.daysLeft = chrome.i18n.getMessage("daysLeft");

  $scope.lastUpdate = chrome.i18n.getMessage("lastUpdate");


  $scope.countOverdues = chrome.i18n.getMessage("countOverdues");
  $scope.countToday = chrome.i18n.getMessage("countToday");
  $scope.countUpcoming = chrome.i18n.getMessage("countUpcoming");
  $scope.countNoDueDate = chrome.i18n.getMessage("countNoDueDate");

  /**
   * Execute JS scripts on launch
   */
  $('.todos > dd').css("display", "none");
  $scope.displayCategory();
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
  
  $scope.getAssignedTodos(); // In any case, trigger a refresh on open 
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

  document.getElementById("needAuth1").innerHTML = chrome.i18n.getMessage("needAuth1");
  document.getElementById("needAuth2").innerHTML = chrome.i18n.getMessage("needAuth2");


});