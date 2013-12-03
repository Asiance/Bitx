'use strict';

angular
.module('basecampExtension.controllers', ['ngResource'])

/**
 * Controller linked to todos.html
 */
.controller('TodosController', function($scope, $filter, Cache) {

  /**
   * Group todos by project name
   * NOTE: Assume that project names are unique otherwise todos will be grouped
   * under the same project
   */
  $scope.groupByProject = function() {
    console.log('LOG: groupByProject');
    $scope.$apply(function() {
      $scope.projects = _.groupBy($scope.allTodos, function(todo) {
        return todo.project;
      });
    });
  };

  /**
   * Custom sort function to compare date in string format as integer
   */
  $scope.sortByDate = function(assignedTodo) {
    if (assignedTodo.due_at !== null) return assignedTodo.due_at.replace(/-/g, '');
    else return '99999999'; // Default value for undefined due date
  };

  /**
   * Return the number of todos of one category
   * @param  {string}  category  Name of the category.
   */
  $scope.getNumberTodos = function(category) {
    var status = $filter('status');
    var keywordSearch = $filter('keywordSearch');
    return _.size(keywordSearch(status($scope.allTodos, category), $scope.search, $scope.userIDs, $scope.people));
  };

  /**
   * Initialization of variables
   */
  Cache.load($scope);
})

/**
 * Controller linked to all views
 */
.controller('MainController', function($scope) {

  /**
   * Open options page in a new tab
   */
  $scope.openOptions = function() {
    chrome.tabs.create({ url: 'options.html' });
    console.log('LOG: openOptions');
  };

  /**
   * Initialization
   */
  $scope.lang   = localStorage.language;
  $scope.online = localStorage.basecampToken ? true : false;
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
    $('#suggestions').getNiceScroll().resize();
    $('#suggestions').getNiceScroll().show();
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
      $scope.search = $scope.search.replace(/(\w+)$/gi, '');
      $scope.search += $filter('removeDomain')(person.email_address);
      $('#suggestions').getNiceScroll().hide();
    }
  };

  /**
   * Clear search input when click on 'x'
   */
  $scope.clearSearch = function(person) {
    $scope.search = '';
    $('#suggestions').getNiceScroll().hide();
  };
})

/**
 * Controller linked to todo directive
 */
.controller('todoCtrl', function($scope, $element, $filter, $http) {
  $scope.$watch('search', function() {
    localStorage.lastSearch = $scope.search;
    $scope.realSearch = $scope.search ? $scope.search.replace(/(from:|to:)\w+\s+/gi, '') : '';
  });

  /**
   * Open tab to view todo on basecamp.com
   * @param  {object}  todo
   */
  $scope.openTodo = function(todo) {
    chrome.tabs.create({ url: todo.url.replace(/[\/]api[\/]v1|[\.]json/gi, '') });
    console.log('LOG: openTodo ID ' + todo.id);
  };

  /**
   * Check a todo
   * @param {object} todo
   */
  $scope.completeTodo = function(todo) {
    var allTodos = $scope.$parent.$parent.$parent.allTodos,
        random   = Math.floor((Math.random() * 3) + 1);
    allTodos.splice(_.indexOf(allTodos, todo), 1);
    $http({
      method: 'PUT',
      url: todo.url,
      data: { completed: true },
      headers: { 'Authorization': 'Bearer ' + localStorage.basecampToken }
    })
    .success(function(data, status, headers, config) {
      chrome.storage.local.set({ 'allTodos': angular.fromJson(angular.toJson(allTodos)) });
    })
    .error(function(data, status, headers, config) {
      console.log('ERROR: completeTodo request failed');
    });
    $($element).addClass('achieved');
    $($element).delay(500).slideUp();
    if ($($element).parent().children().length === $($element).parent().children('.achieved').length) {
      $($element).parent().prev().delay(1000).slideUp();
    }
    $scope.congratulation = $filter('i18n')('achievement' + random);
    console.log('LOG: completeTodo ID ' + todo.id);
  };

  /**
   * Return true if keyword 'from:' is used
   * Allow to add tooltip 'Assigned to someone' in todos.html view
   */
  $scope.isFiltered = function() {
    return new RegExp('from:', 'gi').test($scope.search);
  };
})

.controller('todosCtrl', function($scope) {
  $scope.mostUrgent = function(todo) {
    if (todo.days_late) {
      return -todo.days_late;
    } else if (todo.remaining_days) {
      return todo.remaining_days;
    }
    else return todo.position;
  };
})
