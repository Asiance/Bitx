'use strict';

angular
.module("basecampExtension.controllers", ['ngResource'])

/**
 * Controller linked to todos.html
 */
.controller('TodosController', function($scope, $filter, Authorization, People, User, AssignedTodolists, Todolist, Todo, completeTodo, AllTodolists) {

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
        $scope.getPeople();
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
   * Retrieve the list of people on Basecamp
   */
  $scope.getPeople = function() {
    console.log('LOG: getPeople');
    try {
      People.query({basecampId: $scope.basecampId}, function(data) {
        $scope.people = _.sortBy(data, function(user) { return user.name; });;
        localStorage['people'] = angular.toJson($scope.people);
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
  $scope.getAssignedTodos = function(paramUserId) {
    console.log('LOG: getAssignedTodos');
    try { 
      if (paramUserId == null ) paramUserId = $scope.userId;
      AssignedTodolists.query({basecampId: $scope.basecampId, userId: paramUserId}, function(data) {
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

        // Update only if new todos
        // Works only because Basecamp served the JSON in the same order
        if (angular.toJson(assignedTodos) !== localStorage['assignedTodos']) {
          $scope.assignedTodos = assignedTodos;
          localStorage['assignedTodos'] = angular.toJson(assignedTodos);
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
    var assignedTodos = JSON.parse(localStorage['assignedTodos']);
    for (var i = 0; i < assignedTodos.length; i++) {
      var assignedTodo = assignedTodos[i];
      if (assignedTodo.project !== projectName) {
        var project = {name: assignedTodo.project, id: assignedTodo.project_id, assignedTodos: []};
        projectName = assignedTodo.project;
        projects.push(project);
      }
      project.assignedTodos.push(assignedTodo);
    }

    // Update only if new todos
    // Works only because Basecamp served the JSON in the same order
    if (angular.toJson(projects) !== localStorage['assignedTodosByProject']) {
      localStorage['assignedTodosByProject'] = angular.toJson(projects);
      $scope.projects = projects;
      $scope.displayCategory(); 
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
   * Open tab to view todo on basecamp.com
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
   * Check a todo
   */
  $scope.completeTodo = function(projectId, todoId) {
    console.log('LOG: completeTodo ' + projectId + ' ' + todoId);
    try { 
      completeTodo.completeTodo($scope.basecampId, projectId, todoId);
      $scope.assignedTodos = _.filter($scope.assignedTodos, function(item) {
        return item.id !== todoId;
      });
      $( "#" + todoId.toString()).addClass('achieved');
      $( "#" + todoId.toString()).delay(500).slideUp();
      var random = Math.floor((Math.random()*3)+1);
      $scope.congratulation = window[$scope.lang]['achievement' + random];
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Set the right class (with ng-class) et display (using jQuery) only one category on launch
   */
  $scope.displayCategory = function() {
    try {
      // If no category is active, display the first which is not empty
      $scope.overdue = "";
      $scope.today = "";
      $scope.upcoming = "";
      $scope.no_due_date = "";
      $('.todos > dd').css("display", "none");

      var counter_todos = localStorage['counter_todos'] ? localStorage['counter_todos'] : "default";      
      if (!$scope.overdue && !$scope.today && !$scope.upcoming && !$scope.no_due_date) {
        var status = $filter('status');
        var keywordSearch = $filter('keywordSearch');
        if (status(keywordSearch($scope.assignedTodos, $scope.search), 1).length > 0) {
          $scope.overdue = "active_overdues";
        }
        if (counter_todos == 'overdues' || 
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 1).length > 0)) {
          $('#overdue_content').css("display", "block");
          $scope.overdue = "active active_overdues";        
        }
        else if (counter_todos == 'today' || 
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 2).length > 0)) {
          $scope.today = "active";
          $('#today_content').css("display", "block");
        }
        else if (counter_todos == 'upcoming' || 
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 3).length > 0)) {
          $scope.upcoming = "active";
          $('#upcoming_content').css("display", "block");
        }
        else if (counter_todos == 'no_due_date' || 
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 4).length > 0)) {
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
    try {
      var lang = $scope.lang;
      document.getElementById("search-input").placeholder = window[lang]["searchTodo"];
      document.getElementById("header_overdues").innerHTML = $filter('uppercase')(window[lang]["header_overdues"]);
      document.getElementById("header_today").innerHTML = $filter('uppercase')(window[lang]["header_today"]);
      document.getElementById("header_upcoming").innerHTML = $filter('uppercase')(window[lang]["header_upcoming"]);
      document.getElementById("header_noduedate").innerHTML = $filter('uppercase')(window[lang]["header_noduedate"]);
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
    } catch(e) {
      console.log("ERROR: i18n" + e)
    }
  }  

  /**
   * Display every category and highlight the found string amoung todos (using jQuery)
   * Event triggered by AngularJS
   */
  $scope.$watch('search', function() {
    // If '@someone' has been typed, look for 'someone' among the people on Basecamp
    if ($scope.search && (new RegExp("^@.{2}", "gi")).test($scope.search)) {
      var user = _.find($scope.people, function(user) {
        if ( user['email_address'].match(new RegExp($scope.search.substring(1).split(" ")[0], "gi")) ||
              user['name'].match(new RegExp($scope.search.substring(1), "gi")) )
          return true;
      });
      // If 'someone' has been found, look for his/her todos
      if (user) {
        $scope.getAssignedTodos(user.id);
        console.log("LOG: Search *" + user.name + "* todos");
      }
      // If 'someone' hasn't been found AND you keep type in search input, erase current scope
      else if (!user) {
        $scope.projects = null;
        $scope.assignedTodos = null;
        localStorage['assignedTodosByProject'] = null;
        localStorage['assignedTodos'] = null;
      }
  
      highlight($scope.search.substring($scope.search.indexOf(" ") + 1));
    }
    // If a any word has been typed
    else if ($scope.search) {
      // On key pressed, display the first category which is not empty
      highlight($scope.search);
    }
    // If nothing is typed, fetch your own todos    
    else if ($scope.search === "") {
      $scope.getAssignedTodos();
    }
    // On key pressed, display the first category which is not empty
    $scope.displayCategory();    
  });

  /**
   * Hightlight found string when using search input
   */
  function highlight(string) {
    $(".todo-text, h2").each(function(i, v) {
      var block = $(v);
      block.html(
        block.text().replace(
          new RegExp(string, "gi"), function(match) {
            return ["<span class='highlight'>", match, "</span>"].join("");
        }));
    });   
  }

  /**
   * Initialization of variables
   */
  $scope.i18n();
  var fullInit = false;
  if (localStorage['basecampId'] && localStorage['userId'] && localStorage['people']) {
    $scope.basecampId = localStorage['basecampId'];
    $scope.userId = localStorage['userId'];
    $scope.people = JSON.parse(localStorage['people']);
  } else {
    $scope.getBasecampAccount();
    fullInit = true;
  }
  if (localStorage['myTodos']) {
    $scope.assignedTodos = JSON.parse(localStorage['myTodos']);
  }
  if (localStorage['myTodosByProject']) {
    $scope.projects = JSON.parse(localStorage['myTodosByProject']);
  }
  if (localStorage['people']) {
    $scope.people = JSON.parse(localStorage['people']);
  }
  if (!fullInit) {
    // Trigger a refresh on launch    
    $scope.getAssignedTodos();
    $scope.displayCategory();     
  }

  /**
   * Execute JS scripts on launch
   */
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
  $scope.openOptions = function() {
    chrome.tabs.create({url: "options.html"});
    console.log('LOG: openOptions');
  }

  /**
   * Initialization of i18n
   */
  $scope.i18n = function() { 
    try {
      var userLang = (navigator.language) ? navigator.language : navigator.userLanguage; 
      var lang = userLang.substring(0,2);
      $scope.lang = localStorage["language"] ? localStorage["language"] : lang;
      document.getElementById("needAuth1").innerHTML = window[lang]["needAuth1"];
      document.getElementById("needAuth2").innerHTML = window[lang]["needAuth2"];
    } catch(e) {
      console.log("ERROR: i18n" + e)      
    }
  }

  /**
   * Initialization
   */
  if (localStorage['basecampToken']) $scope.online = true;
  $scope.i18n(); 

});