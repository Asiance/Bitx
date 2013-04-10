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
        var diff = false;
        _.each(data, function(item) { // Check each todo whether it is new or not
          if (!_.findWhere($scope.people, {id: item.id})) diff = true;
        });

        localStorage['people'] = angular.toJson(_.sortBy(data, function(user) { return user.name; }));
        if (diff) {
          $scope.people = _.sortBy(data, function(user) { return user.name; });
          $scope.people.push({"name":"Search by creator", "email_address":"createdby:", "avatar_url":"/img/icon-search.png", "id":-1});
        }
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

          chrome.storage.local.set({'assignedTodos': angular.toJson(allTodos)});
          if (!_.isEqual(allTodos, $scope.assignedTodos)) {
            $scope.assignedTodos = allTodos;
            $scope.groupByProject(true);
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

    function checkIfDone() {
        if (--done == 0) deferred.resolve(allTodolists);
    }

    try {
      var deferred = $q.defer();
      var done = todolists.length;
      var allTodolists = [];

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
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * Group assigned Todos by Project
   */
  $scope.groupByProject = function(update) {
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

    chrome.storage.local.set({'assignedTodosByProject': angular.toJson(projects)});
    if (update) $scope.projects = projects;

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
      $http({
        method: 'PUT',
        url: 'https://basecamp.com/'+$scope.basecampId+'/api/v1/projects/'+projectId+'/todos/'+todoId+'.json',
        data: {completed:true},
        headers: {'Authorization':'Bearer ' + localStorage['basecampToken']}})
      .success(function(data, status, headers, config) {
        $scope.assignedTodos = _.filter($scope.assignedTodos, function(item) {
          return item.id !== todoId;
        });
        chrome.storage.local.set({'assignedTodos': angular.toJson($scope.assignedTodos)});
        $scope.groupByProject(false);
      })
      .error(function(data, status, headers, config) {
        console.log('ERROR: completeTodo request failed');
      });

      $("#" + todoId.toString()).addClass('achieved');
      $("#" + todoId.toString()).delay(500).slideUp();
      if ($("#" + todoId.toString()).parent().children().length
          == $("#" + todoId.toString()).parent().children('.achieved').length) {
        $("#" + todoId.toString()).parent().prev().delay(1000).slideUp();
      }
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
      $('#todos').find('dd').css('display', 'none');
      // If no category is active, display the first which is not empty
      var counter_todos = localStorage['counter_todos'] ? localStorage['counter_todos'] : "default";
      if (!$scope.overdue && !$scope.today && !$scope.upcoming && !$scope.no_due_date) {
        var status = $filter('status');
        var keywordSearch = $filter('keywordSearch');
        if (counter_todos == 'overdues' ||
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 1).length > 0)) {
          $('#overdue_content').css('display', 'block');
          $scope.overdue = "active";
        }
        else if (counter_todos == 'today' ||
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 2).length > 0)) {
          $scope.today = "active";
          $('#overdue_content').css('display', 'block');
        }
        else if (counter_todos == 'upcoming' ||
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 3).length > 0)) {
          $scope.upcoming = "active";
          $('#upcoming_content').css('display', 'block');
        }
        else if (counter_todos == 'no_due_date' ||
          (counter_todos == 'default' && status(keywordSearch($scope.assignedTodos, $scope.search), 4).length > 0)) {
          $scope.no_due_date = "active";
          $('#no_due_date_content').css('display', 'block');
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * Custom sort function to compare date in string format as integer
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
    $scope.suggestionsPosition = -1;
    if ($scope.search) {
      highlight($scope.search);
    }
    // If nothing is typed, fetch your own todos
    if ($scope.search === "") {
      $scope.getAssignedTodos();
    }
    // On key pressed, display the first category which is not empty
    if ($scope.search && $scope.search.length != 0)
      $scope.displayCategory();
    else {
      $('#suggestions').css({'z-index': '1'});
      $("#ascrail2000").css({'z-index': '1'});
      $("#ascrail2000-hr").css({'z-index': '1'});
    }
  });

  /**
   * Hightlight found string when using search input
   * @param  {string}  string  String to highlight.
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
    $(".person .username, .person .fullname").each(function(i, v) {
      var block = $(v);
      block.html(
        block.text().replace(
          new RegExp(string, "gi"), function(match) {
            return ["<span class='strong'>", match, "</span>"].join("");
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
    $scope.people.push({"name":"Search by creator", "email_address":"createdby:", "avatar_url":"/img/icon-search.png", "id":-1});
  } else {
    $scope.getBasecampAccount();
    fullInit = true;
  }
  chrome.storage.local.get('assignedTodos', function(data) {
    if (!_.isEmpty(data)) {
      $scope.assignedTodos = angular.fromJson(data['assignedTodos']);
      $scope.$apply();
    } else {
      $scope.getAssignedTodos();
    }
  });

  chrome.storage.local.get('assignedTodosByProject', function(data) {
    $scope.projects = angular.fromJson(data['assignedTodosByProject']);
    $scope.$apply();
  });

  if (!fullInit) {
    $scope.getAssignedTodos(); // Trigger a refresh on launch
    $scope.getPeople();
  }
  $scope.displayCategory();
  $("#suggestions").niceScroll({
    cursorcolor: '#a7a7a7',
    cursoropacitymax: 0.8,
    mousescrollstep : 20,
    cursorborder: '0px',
    cursorwidth: '8px',
  });
  $("section").niceScroll({
    cursorcolor: '#a7a7a7',
    cursoropacitymax: 0.8,
    mousescrollstep : 50,
    cursorborder: '0px',
    cursorwidth: '8px',
  })
  /**
   * Hightlight found string when using search input
   * @param  {string}  category  Name of the category to toggle ie. <dt id='{category}'>.
   */
  $scope.toggleContent = function(category) {
    var statusVal;
    var status = $filter('status');
    var keywordSearch = $filter('keywordSearch');
    switch (category) {
      case 'overdues': statusVal = 1; break;
      case 'today' : statusVal = 2; break;
      case 'upcoming' : statusVal = 3; break;
      case 'no-due-date' : statusVal = 4; break;
      default : statusVal = 1; break;
    }

    if (status(keywordSearch($scope.assignedTodos, $scope.search), statusVal).length > 0) {
      if ($('#' + category).hasClass('active')) {
        $('#' + category).next().slideUp(500, 'easeOutQuad');
        $('#' + category).removeClass('active');
      }
      else {
        $('#todos').find('dt').removeClass('active');
        $('#' + category).addClass('active');
        $('#todos').find('dd').slideUp();
        $('#' + category).next().slideDown({
          duration: 500,
          easing: 'easeOutQuad',
          progress: function() {
            $("section").getNiceScroll().resize();
          }
        });
      }
    }
  }

  $('#search-input').keydown(function(evt) {
    $scope.$apply(function() {
      $scope.handleKeypress.call($scope, evt.which);
    });
    if (evt.which == 38 || evt.which == 40) {
      return false;
    }
  });

  /**
   * Allow to navigate through suggestions with keyboard (UP and DOWN)
   * @param  {number}  key  Code related to key event.
   */
  $scope.handleKeypress = function(key) {

    var printableChar =
        (key > 47 && key < 58)   || // number keys
        key == 32 || key == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
        (key > 64 && key < 91)   || // letter keys
        (key > 95 && key < 112)  || // numpad keys
        (key > 185 && key < 193) || // ;=,-./` (in order)
        (key > 218 && key < 223);   // [\]' (in order)

    if (printableChar) {
      $('#suggestions').css({'z-index': '1'});
      $("#ascrail2000").css({'z-index': '1'});
      $("#ascrail2000-hr").css({'z-index': '1'});
    }
    if (key == 40 && $scope.suggestionsPosition < $filter('suggestionSearch')($scope.people, $scope.search).length -1) {
      $scope.suggestionsPosition += 1;
    } else if (key == 38 && $scope.suggestionsPosition > -1) {
      $scope.suggestionsPosition -= 1;
    } else if (key == 13) {
      if ($scope.suggestionsPosition == -1)
        $scope.setSearch($filter('suggestionSearch')($scope.people, $scope.search)[0]['email_address']);
      else $scope.setSearch($filter('suggestionSearch')($scope.people, $scope.search)[$scope.suggestionsPosition]['email_address']);
    }
  };

  /**
   * When press ENTER or click on a suggestion, set the new value to the search input
   * We use the email address to extract a username
   * @param  {string}  email_address  Email address of the person selected.
   */
  $scope.setSearch = function(email_address) {
    $scope.search = $scope.search.substr(0, $scope.search.lastIndexOf("@") + 1);
    $scope.search += $filter('removeDomain')(email_address);
    $('#suggestions').css({'z-index': '-1'});
    $("#ascrail2000").css({'z-index': '-1'});
    $("#ascrail2000-hr").css({'z-index': '-1'});
  }

  /**
   * Function called on ng-mouseover of suggestion box to highlight hovered selection
   * @param  {number}  index  Index of the selected suggestion in the array.
   */
  $scope.setActive = function(index) {
    $scope.suggestionsPosition = index;
  }

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