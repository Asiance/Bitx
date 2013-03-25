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
        var assignedTodos = [];
        for (var i = 0; i < data.length; i++) { 
          for (var j = 0; j < data[i].assigned_todos.length; j++) { 
            var tmp = data[i].assigned_todos[j];
            tmp.project = data[i].bucket.name;
            tmp.project_id = data[i].bucket.id;
            tmp.todolist = data[i].name;
            assignedTodos.push(tmp);
          }
        }
        if (assignedTodos != $scope.assignedTodos) {
          $scope.assignedTodos = assignedTodos;
          localStorage['assignedTodos'] = JSON.stringify(assignedTodos);          
          $scope.groupByProject();
        }
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
    var projects = [];
    var projectName = 'NO_PROJECT';
    var assignedTodos = $scope.assignedTodos;
    for (var i = 0; i < assignedTodos.length; i++) {
      var assignedTodo = assignedTodos[i];
      if (assignedTodo.project !== projectName) {
        var project = {name: assignedTodo.project, id: assignedTodo.project_id, assignedTodos: []};
        projectName = assignedTodo.project;
        projects.push(project);
      }
      project.assignedTodos.push(assignedTodo);
    }

    // Update only if new Todos
    if (!_.isEqual(projects, $scope.projects)) {
      localStorage['assignedTodosByProject'] = JSON.stringify(projects);
      $scope.projects = projects;
    }
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
      $( "#" + todoId.toString()).addClass('disappear');
      $( "#" + todoId.toString()).delay(600).slideUp();
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
      $scope.i18n();
      // If no category is active, display the first which is not empty
      var counter_todos = localStorage['counter_todos'] ? localStorage['counter_todos'] : "default";      
      if (!$scope.overdue && !$scope.today && !$scope.upcoming && !$scope.no_due_date) {
        var status = $filter('status');
        if (status($scope.assignedTodos, 1).length > 0) {
          $scope.overdue = "active_overdues";
        }
        if (counter_todos == 'overdues' || 
          (counter_todos == 'default' && status($scope.assignedTodos, 1).length > 0)) {
          $('#overdue_content').css("display", "block");
          $scope.overdue = "active active_overdues";        
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
   * Initialization of i18n
   */
  $scope.i18n = function() {
    var lang = $scope.lang;
    document.getElementById("search-input").placeholder = window[lang]["searchTodo"];

    document.getElementById("header_overdues").innerHTML = window[lang]["header_overdues"];
    document.getElementById("header_today").innerHTML = window[lang]["header_today"];
    document.getElementById("header_upcoming").innerHTML = window[lang]["header_upcoming"];
    document.getElementById("header_noduedate").innerHTML = window[lang]["header_noduedate"];

    $scope.addedDate = window[lang]["addedDate"];

    $scope.dayLate = window[lang]["dayLate"];
    $scope.daysLate = window[lang]["daysLate"];

    $scope.dayLeft = window[lang]["dayLeft"];
    $scope.daysLeft = window[lang]["daysLeft"];

    $scope.lastUpdate = window[lang]["lastUpdate"];

    $scope.countOverdues = window[lang]["countOverdues"];
    $scope.countToday = window[lang]["countToday"];
    $scope.countUpcoming = window[lang]["countUpcoming"];
    $scope.countNoDueDate = window[lang]["countNoDueDate"];
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
  $scope.getAssignedTodos();

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
    $scope.assignedTodos = [];
    $scope.basecampId = [];
    $scope.userId = [];
    window.close();
    localStorage.clear();    
  }
  if (localStorage['basecampToken']) $scope.online = true;

  /**
   * Initialization of i18n
   */
  var userLang = (navigator.language) ? navigator.language : navigator.userLanguage; 
  var lang = userLang.substring(0,2);
  $scope.lang = localStorage["language"] ? localStorage["language"] : lang;
  document.getElementById("needAuth1").innerHTML = window[lang]["needAuth1"];
  document.getElementById("needAuth2").innerHTML = window[lang]["needAuth2"];

});