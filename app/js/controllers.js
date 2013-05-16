'use strict';

angular
.module("basecampExtension.controllers", ['ngResource'])

/**
 * Controller linked to todos.html
 */
.controller('TodosController', function($scope, $filter, $q, $http, Authorization, People, User, completeTodo, AllTodolists, Todolist, Cache) {

  /**
   * After OAuth2 signin, retrieve a Basecamp Account
   */
  $scope.getBasecampAccount = function() {
    console.log('LOG: getBasecampAccount');
    try {
      Authorization.query(function(data) {
        $scope.basecampId = _.findWhere(data.accounts, {product: "bcx"}).id;
        localStorage.basecampId = $scope.basecampId;
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
        localStorage.userId = data.id;
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
      People.query({basecampId: $scope.basecampId}, function(data, headers) {
        if (headers('Status') != '304 Not Modified' ||  !localStorage.people) {
          localStorage.people = angular.toJson(_.sortBy(data, function(user) { return user.name; }));
          $scope.people = _.sortBy(data, function(user) { return user.name; });
          $scope.people.push({"name":"Alias", "email_address":"me", "avatar_url":"/img/icon-search.png", "id":localStorage.userId});
          $scope.people.push({"name":"Search by creator", "email_address":"from:", "avatar_url":"/img/icon-search.png", "id":-1});
          $scope.people.push({"name":"Search by assignee", "email_address":"to:", "avatar_url":"/img/icon-search.png", "id":-1});
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
      AllTodolists.query({basecampId: $scope.basecampId}, function(todolists, getResponseHeaders) {
        if(getResponseHeaders('Status') == "200 OK" || !$scope.assignedTodos) {
          localStorage.updateBadge = true;
          var allTodos = [];
          var promise = asyncRequests(todolists);
          promise.then(function(allTodolists) {
            _.each(allTodolists, function (todolist) {
              _.each(todolist.todos.remaining, function(todo) {
                todo.todolist = todolist.name;
                todo.project = todolist.project;
                todo.project_id = todolist.project_id;
                allTodos.push(todo);
              });
            });

            allTodos = _.chain(allTodos).sortBy(function(todo) { return todo.id; })
                        .sortBy(function(todo) { return todo.project_id; })
                        .value();

            $scope.assignedTodos = allTodos;
            $scope.groupByProject();
          });
        }
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
      if (--done === 0) {
        deferred.resolve(allTodolists);
      }
    }

    try {
      var deferred = $q.defer();
      var done = todolists.length;
      var modified = false;
      var allTodolists = [];

      _.forEach(todolists, function (todolist) {
        $http({
          method: 'GET',
          url: 'https://basecamp.com/'+ $scope.basecampId + '/api/v1/projects/' + todolist.bucket.id + '/todolists/' + todolist.id + '.json',
          headers:  {'Authorization':'Bearer ' + localStorage.basecampToken}
        })
        .success(function(data, status, headers) {
          data.project_id = todolist.bucket.id;
          data.project = todolist.bucket.name;
          allTodolists.push(data);
          checkIfDone();
        })
        .error(function() {
          console.log('ERROR: syncRequests - Unable to get one todolist');
        });
      });
      return deferred.promise;
    } catch(e) {
      console.log(e);
    }
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
    $scope.projects = projects;
  };

  /**
   * Custom sort function to compare date in string format as integer
   */
  $scope.sortByDate = function(assignedTodo) {
    if (assignedTodo.due_at !== null) return assignedTodo.due_at.replace(/-/g, "");
    else return "99999999"; // Default value for undefined due date
  };

  /**
   * Return the number of todos of one category
   * @param  {string}  category  Name of the category.
   */
  $scope.getNumberTodos = function(category) {
    var status = $filter('status');
    var keywordSearch = $filter('keywordSearch');
    return _.size(keywordSearch(status($scope.assignedTodos, category), $scope.search));
  };

  /**
   * Initialization of variables
   */
  Cache.loadTodos($scope);
  Cache.loadParams($scope);

  $scope.$on('updateParentScopeEvent', function(event, todoId) {
    $scope.assignedTodos = _.filter($scope.assignedTodos, function(item) {
      return item.id !== todoId;
    });
  });

})

/**
 * Controller linked to all views
 */
.controller('MainController', function($scope, $filter) {

  /**
   * Open options page in a new tab
   */
  $scope.openOptions = function() {
    chrome.tabs.create({url: "options.html"});
    console.log('LOG: openOptions');
  };

  /**
   * Initialization
   */
  if (localStorage.language) {
    $scope.lang = localStorage.language;
  } else {
    var userLang = (navigator.language) ? navigator.language : navigator.userLanguage;
    var lang = userLang.substring(0,2);
    $scope.lang = lang;
    localStorage.language = lang;
  }
  if (localStorage.basecampToken) {
    $scope.online = true;
  }
})

/**
 * Controller linked to search input directive
 */
.controller('searchSuggestionsCtrl', function($scope, $filter) {
  $scope.navPosition = -1;

  $scope.$watch('search', function() {
    localStorage.lastSearch = $scope.search;
    if ($scope.search) {
      $scope.realSearch = $scope.search.match(/[^ ||^:]*$/);
    }
    $("#suggestions").getNiceScroll().resize();
    $("#suggestions").getNiceScroll().show();
    $scope.navPosition = -1;
  });

  $scope.completeSearch = function($event) {
    if ($scope.navPosition === -1) {
      $scope.setSearch($scope.filteredData[0]);
    }
    else {
      $scope.setSearch($scope.filteredData[$scope.navPosition]);
    }
    $event.preventDefault();
  };

  $scope.navigateUp = function($event) {
    var frameOffset = document.getElementById('suggestions').scrollTop;
    if ($scope.navPosition > -1) {
      $scope.navPosition--;
      var framePosition = ($scope.navPosition + 1) - (frameOffset-50)/50;
      var objDiv = document.getElementById($scope.navPosition);
      if (Math.round(framePosition) === 1) {
        objDiv.scrollIntoView(true);
      }
    }
    $event.preventDefault();
  };

  $scope.navigateDown = function($event) {
    var frameOffset = document.getElementById('suggestions').scrollTop;
    if ($scope.navPosition < $scope.filteredData.length - 1) {
      $scope.navPosition += 1;
      var framePosition = ($scope.navPosition+1) - (frameOffset+50)/50;
      var objDiv = document.getElementById($scope.navPosition);
      if (Math.round(framePosition) === 4) {
        objDiv.scrollIntoView(false);
      }
    }
    $event.preventDefault();
  };

  $scope.setNavPosition = function($index) {
    $scope.navPosition = $index;
  };

  /**
   * When press ENTER or click on a suggestion, set the new value to the search input
   * We use the email address to extract a username
   * @param  {object}  person  Person selected among the suggestions.
   */
  $scope.setSearch = function(person) {
    if(person) {
      $scope.search = $scope.search.replace(/(\w+)$/gi, "");
      $scope.search += $filter("removeDomain")(person.email_address);
      $("#suggestions").getNiceScroll().hide();
    }
  };

  /**
   * Clear search input when click on 'x'
   */
  $scope.clearSearch = function(person) {
    $scope.search = "";
    $("#suggestions").getNiceScroll().hide();
  };
})

/**
 * Controller linked to todo directive
 */
.controller('todoCtrl', function($scope, $element, $filter, $http) {
  $scope.$watch('search', function() {
    localStorage.lastSearch = $scope.search;
    if ($scope.search) {
      $scope.realSearch = $scope.search.replace(/(from:|to:)\w+\s+/gi, "");
    }
  });

  /**
   * Open tab to view todo on basecamp.com
   * @param  {number}  projectId
   * @param  {number}  todoId
   */
  $scope.openTodo = function(projectId, todoId) {
    console.log('LOG: openTodo ' + projectId + " " + todoId);
    try {
      chrome.tabs.create({url: "https://basecamp.com/" + localStorage.basecampId + "/projects/" + projectId + "/todos/" + todoId});
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
        url: 'https://basecamp.com/'+ localStorage.basecampId +'/api/v1/projects/'+projectId+'/todos/'+todoId+'.json',
        data: {completed:true},
        headers: {'Authorization':'Bearer ' + localStorage.basecampToken}})
      .success(function(data, status, headers, config) {
        chrome.storage.local.set({'assignedTodos': angular.toJson($scope.assignedTodos)});
      })
      .error(function(data, status, headers, config) {
        console.log('ERROR: completeTodo request failed');
      });
      $($element).addClass('achieved');
      $($element).delay(500).slideUp();
      if ($($element).parent().children().length === $($element).parent().children('.achieved').length) {
        $($element).parent().prev().delay(1000).slideUp();
      }
      var random = Math.floor((Math.random()*3)+1);
      $scope.congratulation = $filter("i18n")('achievement' + random);

      $scope.$emit('updateParentScopeEvent', todoId);
    } catch(e) {
      console.log(e);
    }
  };

  /**
   * Return true if keyword 'from:' is used
   * Allow to add tooltip 'Assigned to someone' in todos.html view
   */
  $scope.isFiltered = function() {
    return (new RegExp("from:", "gi").test($scope.search));
  };
});