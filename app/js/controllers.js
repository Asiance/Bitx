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
      People.query({basecampId: $scope.basecampId}, function(data, headers) {
        if (headers('Status') != '304 Not Modified' ||  !localStorage['people']) {
          localStorage['people'] = angular.toJson(_.sortBy(data, function(user) { return user.name; }));
          $scope.people = _.sortBy(data, function(user) { return user.name; });
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
   * Set the right class (with ng-class) et display (using jQuery) only one category on launch
   */
  $scope.displayCategory = function(display) {
    console.log('LOG: displayCategory');
    try {
      $('#todos').find('dd').css('display', 'none');
      $('#todos').find('dt').removeClass('active');
      // If no category is active, display the first which is not empty
      if (display) {
        var status = $filter('status');
        var keywordSearch = $filter('keywordSearch');
        if (_.size(status(keywordSearch($scope.assignedTodos, $scope.search), 'overdues')) > 0) {
          $('#overdues_content').css('display', 'block');
          $('#overdues').addClass('active');
        }
        else if (_.size(status(keywordSearch($scope.assignedTodos, $scope.search), 'today')) > 0) {
          $('#today_content').css('display', 'block');
          $('#today').addClass('active');
        }
        else if (_.size(status(keywordSearch($scope.assignedTodos, $scope.search), 'upcoming')) > 0) {
          $scope.upcoming = "active";
          $('#upcoming_content').css('display', 'block');
          $('#upcoming').addClass('active');
        }
        else if (_.size(status(keywordSearch($scope.assignedTodos, $scope.search), 'noduedate')) > 0) {
          $scope.no_due_date = "active";
          $('#noduedate_content').css('display', 'block');
          $('#noduedate').addClass('active');
       }
      }
    } catch(e) {
      console.log(e);
    }
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
   * Listen to keyboard event using jQuery
   */
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

    var frameOffset = document.getElementById('suggestions').scrollTop; // get how much pixels you have scrolled

    var printableChar =
        (key > 47 && key < 58)   || // number keys
        key == 32 || key == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
        (key > 64 && key < 91)   || // letter keys
        (key > 95 && key < 112)  || // numpad keys
        (key > 185 && key < 193) || // ;=,-./` (in order)
        (key > 218 && key < 223) || // [\]' (in order)
        key == 8;                   // backspace
    // if you type or delete a character, display the suggestions, and allows you to scroll
    if (printableChar) {
      $scope.displayCategory(true);
      $("#suggestions").css({'z-index': '10'});
      $("#suggestions").getNiceScroll().resize();
      $("#ascrail2000").css({'z-index': '10'});
    }

    if (key == 40 && $scope.suggestionsPosition < $filter('suggestionSearch')($scope.people, $scope.search).length -1) {
      $scope.suggestionsPosition += 1;
      var framePosition = ($scope.suggestionsPosition+1) - (frameOffset+50)/50;
      var objDiv = document.getElementById($scope.suggestionsPosition);
      if (Math.round(framePosition) == 4) {
        objDiv.scrollIntoView(false);
      }
    } else if (key == 38 && $scope.suggestionsPosition > -1) {
      $scope.suggestionsPosition -= 1;
      var framePosition = ($scope.suggestionsPosition+1) - (frameOffset-50)/50;
      var objDiv = document.getElementById($scope.suggestionsPosition);
      if (Math.round(framePosition) == 1) {
        objDiv.scrollIntoView(true);
      }
    } else if (key == 13) {
      if ($scope.suggestionsPosition == -1)
        $scope.setSearch($filter('suggestionSearch')($scope.people, $scope.search)[0]);
      else $scope.setSearch($filter('suggestionSearch')($scope.people, $scope.search)[$scope.suggestionsPosition]);
    }

  };

  /**
   * Display every category and highlight the found string amoung todos (using jQuery)
   * Event triggered by AngularJS
   */
  $scope.$watch('search', function() {
    localStorage['lastSearch'] = $scope.search;
    $scope.suggestionsPosition = -1;
    if ($scope.search) {
      highlight($scope.search);
    }
    // On key pressed, display the first category which is not empty
    else if (!$scope.search || $scope.search.length == 0) {
      $scope.displayCategory(false);
    }
  });

  /**
   * Hightlight found string when using search input
   * @param  {string}  string  String to highlight.
   */
  function highlight(string) {

    var realSearch = string.replace(/(from:|to:)\w+\s+/gi, "");
    // Highlight project name and todo text
    $(".todo-text, h2").each(function(i, v) {
      var block = $(v);
      block.html(
        block.text().replace(
          new RegExp(realSearch, "gi"), function(match) {
            return ["<span class='highlight'>", match, "</span>"].join("");
        }));
    });
    // Highlight keywords and name in suggestions
    $(".person .username, .person .fullname").each(function(i, v) {
      var block = $(v);
      block.html(
        block.text().replace(
          new RegExp(string.match(/[^ ||^:]*$/), "gi"), function(match) {
            return ["<span class='strong'>", match, "</span>"].join("");
        }));
    });
  };

  /**
   * When press ENTER or click on a suggestion, set the new value to the search input
   * We use the email address to extract a username
   * @param  {string}  email_address  Email address of the person selected.
   */
  $scope.setSearch = function(person) {
    $scope.search = $scope.search.replace(/(\w+)$/gi, "")
    $scope.search += $filter("removeDomain")(person.email_address);
    $("#suggestions").css({"z-index": "-1"});
    $("#ascrail2000").css({"z-index": "-1"});
  };

  /**
   * Clear search input when click on 'x'
   */
  $scope.clearSearch = function(person) {
    $scope.search = "";
    $("#ascrail2000").css({'z-index': '-1'});
  };

  /**
   * Function called on ng-mouseover of suggestion box to highlight hovered selection
   * @param  {number}  index  Index of the selected suggestion in the array.
   */
  $scope.setActive = function(index) {
    $scope.suggestionsPosition = index;
  };


  /**
   * Initialization of variables
   */
  $scope.search = localStorage['lastSearch'] ? localStorage['lastSearch'] : "";
  if (localStorage['basecampId'] && localStorage['userId'] && localStorage['people']) {
    $scope.basecampId = localStorage['basecampId'];
    $scope.userId = localStorage['userId'];
    $scope.people = angular.fromJson(localStorage['people']);
    $scope.people.push({"name":"Search by creator", "email_address":"from:", "avatar_url":"/img/icon-search.png", "id":-1});
    $scope.people.push({"name":"Search by assignee", "email_address":"to:", "avatar_url":"/img/icon-search.png", "id":-1});
    $scope.getAssignedTodos(); // Trigger a refresh on launch
    $scope.getPeople();
  } else {
    $scope.getBasecampAccount();
  }

  // Load data from cache
  chrome.storage.local.get('assignedTodos', function(data) {
    if (!_.isEmpty(data.assignedTodos)) {
      $scope.assignedTodos = angular.fromJson(data['assignedTodos']);
      $scope.groupByProject();
      $scope.$apply();
    }
  });

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