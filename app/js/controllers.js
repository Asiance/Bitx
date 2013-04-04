'use strict';

angular
.module("basecampExtension.controllers", ['ngResource'])

/**
 * Controller linked to todos.html
 */
.controller('TodosController', function($scope, $filter, $q, $http, Authorization, People, User, completeTodo, AllTodolists, Todolist) {

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
        console.log('ERROR: Failed to connect!');
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
        console.log('ERROR: Failed to connect!');
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
        $scope.people = _.sortBy(data, function(user) { return user.name; });
        localStorage['people'] = angular.toJson($scope.people);
      }, function(response) {
        console.log('ERROR: Failed to connect!');
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Fetch Todolists
   * and remove the 'Todolist level' to keep only remaining Todos
   */
  $scope.getAssignedTodos = function() {
    console.log('LOG: getAssignedTodos');
    try { 
      AllTodolists.query({basecampId: $scope.basecampId}, function(todolists) {
        var allTodos = [];          
        var promise = asyncRequests(todolists);
        promise.then(function(allTodolists) {
          _.forEach(allTodolists, function (todolist) {
            _.forEach(todolist.todos.remaining, function(todo) {
              todo.todolist = todolist.name;
              todo.project = todolist.project;
              todo.project_id = todolist.project_id;
              allTodos.push(todo);
            })
          })
          allTodos = _.chain(allTodos).sortBy(function(todo) { return todo.id; })
                      .sortBy(function(todo) { return todo.project_id; })
                      .value();
          // Update only if new todos
          // Works only because we sorted todos by ID
          if (angular.toJson(allTodos) !== localStorage['assignedTodos']) {
            $scope.assignedTodos = allTodos;
            localStorage['assignedTodos'] = angular.toJson(allTodos);
            $scope.groupByProject();
          }
        });
      }, function(response) {
        console.log('ERROR: Failed to connect!');
      });
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Fetch every active Todolist, return them when each of them are fetched
   * @param  {object}  todolists  Object return by GET /todolists.json
   */
  function asyncRequests(todolists) {
    var deferred = $q.defer();
    var done = todolists.length;
    var allTodolists = [];

    function checkIfDone() {
      if (--done == 0) deferred.resolve(allTodolists);
    }

    _.forEach(todolists, function (todolist) {
      $http({
        method: 'GET', 
        url: 'https://basecamp.com/'+ $scope.basecampId + '/api/v1/projects/' + todolist.bucket.id + '/todolists/' + todolist.id + '.json',
        headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
      })
      .success(function(data) {
        data.project_id = todolist.bucket.id;
        data.project = todolist.bucket.name;
        allTodolists.push(data);
        checkIfDone();
      })
      .error(function() {
        console.log('ERROR: syncRequests - Unable to get one todolist');
        checkIfDone();
      })
    })
    return deferred.promise;
  }

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
    console.log(projects);

    // Update only if new todos
    // Works only because we sorted todos by ID
    if (angular.toJson(projects) !== localStorage['assignedTodosByProject']) {
      localStorage['assignedTodosByProject'] = angular.toJson(projects);
      $scope.projects = projects;
      $scope.displayCategory(); 
    }
  };

  /**
   * Open tab to view todo on basecamp.com
   * @param  {number}  projectId
   * @param  {number}  todoId
   */
  $scope.openTodo = function(projectId, todoId) {
    console.log('LOG: openTodo ' + projectId + " " + todoId);
    try { 
      chrome.tabs.create({url: "https://basecamp.com/" + $scope.basecampId + "/projects/" + projectId + "/todos/" + todoId});
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Check a todo
   * @param  {number}  projectId
   * @param  {number}  todoId
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
      $scope.overdue = "";
      $scope.today = "";
      $scope.upcoming = "";
      $scope.no_due_date = "";
      $('.todos > dd').css("display", "none");
      
      // If no category is active, display the first which is not empty
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
   * Custom sort function to compare date in YYYYMMDD format
   */
  $scope.sortByDate = function(assignedTodo) {
    if (assignedTodo.due_at != null) return assignedTodo.due_at.replace(/-/g, "");
    else return "99999999"; // Default value for undefined due date
  };

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
      $scope.dayLate = window[lang]["dayLate"];
      $scope.daysLate = window[lang]["daysLate"];
      $scope.dayLeft = window[lang]["dayLeft"];
      $scope.daysLeft = window[lang]["daysLeft"];

      $scope.countOverdues = window[lang]["countOverdues"];
      $scope.countToday = window[lang]["countToday"];
      $scope.countUpcoming = window[lang]["countUpcoming"];
      $scope.countNoDueDate = window[lang]["countNoDueDate"];
      
      $scope.lastUpdate = window[lang]["lastUpdate"];
      $scope.createdDate = window[lang]["createdDate"];
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
    if ($scope.search &&
            ((new RegExp("^@.{2}", "gi")).test($scope.search)
            || (new RegExp("^:created", "gi")).test($scope.search))) {    
      highlight($scope.search.substring($scope.search.indexOf(" ") + 1));
    }
    // If a any word has been typed
    else if ($scope.search) {
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
   * @param  {string}  string  String to hightlight.
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
    $scope.people = angular.fromJson(localStorage['people']);
  } else {
    $scope.getBasecampAccount();
    fullInit = true;
  }
  if (localStorage['assignedTodos']) {
    $scope.assignedTodos = angular.fromJson(localStorage['assignedTodos']);
  }
  if (localStorage['assignedTodosByProject']) {
    $scope.projects = angular.fromJson(localStorage['assignedTodosByProject']);
  }
  if (localStorage['people']) {
    $scope.people = angular.fromJson(localStorage['people']);
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
  if (localStorage['scrollbar'] === '1') document.getElementsByTagName("dl")[0].style.width = '500px';

})

/**
 * Controller linked to all views
 */
.controller('MainController', function($scope) {

  /**
   * Open options page in a new tab
   */
  $scope.openOptions = function() {
    chrome.tabs.create({url: "views/options.html"});
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