'use strict';

angular
.module('basecampExtension.controllers', [])

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

  $scope.startOauth = function() {
    window.oauth2.start();
  };

  /**
   * Initialization
   */
  $scope.lang   = localStorage.language;
  $scope.online = localStorage.basecampToken ? true : false;
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
    $element.addClass('achieved');
    $($element).delay(500).slideUp();
    if ($element.parent().children().length === $($element).parent().children('.achieved').length) {
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
});
