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
      People.query({basecampId: $scope.basecampId}, function(data, headers) {
        if (headers('Status') != '304 Not Modified' ||  !localStorage['people']) {
          localStorage['people'] = angular.toJson(_.sortBy(data, function(user) { return user.name; }));
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
          localStorage['updateBadge'] = true;
          var allTodos = [];
          var promise = asyncRequests(todolists);
          promise.then(function(allTodolists) {
            _.each(allTodolists, function (todolist) {
              _.each(todolist.todos.remaining, function(todo) {
                todo.todolist = todolist.name;
                todo.project = todolist.project;
                todo.project_id = todolist.project_id;
                allTodos.push(todo);
              })
            })

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
      if (--done == 0) {
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
          headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
        })
        .success(function(data, status, headers) {
          data.project_id = todolist.bucket.id;
          data.project = todolist.bucket.name;
          allTodolists.push(data);
          checkIfDone();
        })
        .error(function() {
          console.log('ERROR: syncRequests - Unable to get one todolist');
        })
      })
      return deferred.promise;
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
    $scope.projects = projects;
  };

  /**
   * Custom sort function to compare date in string format as integer
   */
  $scope.sortByDate = function(assignedTodo) {
    if (assignedTodo.due_at != null) return assignedTodo.due_at.replace(/-/g, "");
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
  if (localStorage["language"]) {
    $scope.lang = localStorage["language"];
  } else {
    var userLang = (navigator.language) ? navigator.language : navigator.userLanguage;
    var lang = userLang.substring(0,2);
    $scope.lang = lang;
    localStorage["language"] = lang;
  }
  if (localStorage["basecampToken"]) {
    $scope.online = true;
  }
});