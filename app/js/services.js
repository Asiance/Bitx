'use strict';

angular
.module('basecampExtension.services', ['ngResource'])

/*
 * Get all organizations where the User is involved
 */
.factory('Authorization', function($resource) {
  return $resource('https://launchpad.37signals.com/authorization.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	false,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

/*
 * Get information about a User
 */
.factory('User', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/people/me.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	false,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

/*
 * Get People will return all people on the account
 */
.factory('People', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/people.json', {}, {
    query: {
      method:   'GET',
      isArray:  true,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

/*
 * Get ACTIVE Assigned Todolists of a User
 */
.factory('AssignedTodolists', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/people/:userId/assigned_todos.json', {}, {
    query: {
      method:   'GET',
      isArray:  true,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

/*
 * Get infos about a Todo
 */
.factory('Todo', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects/:projectId/todos/:todoId.json', {}, {
    query: {
      method:   'GET',
      isArray:  true,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
    }
  });
})

/*
 * Check a Todo
 */
.factory('completeTodo', function($http) {
  return {
    completeTodo: function(basecampId, projectId, todoId) {
      $http.put('https://basecamp.com/'+basecampId+'/api/v1/projects/'+projectId+'/todos/'+todoId+'.json',
      {completed:true},
      {headers: {'Authorization':'Bearer ' + localStorage['basecampToken']}});
    }
  }
})

/*
 * Get all ACTIVE Todolist
 */
.factory('AllTodolists', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/todolists.json', {}, {
    query: {
      method:   'GET',
      isArray:  true,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

/*
 * Get a Todolist of a Project
 */
.factory('Todolist', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects/:projectId/todolists/:todolistId.json', {}, {
    query: {
      method:   'GET',
      isArray:  false,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

.factory('Utils', function () {
  return {
    dateToYMD: function (date) {
      var d = date.getDate(),
          m = date.getMonth() + 1,
          y = date.getFullYear();
      return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }
  }
})

.factory('Cache', function () {
  // Load data from cache
  return {
    loadParams: function(scope) {
      scope.search = localStorage['lastSearch'] ? localStorage['lastSearch'] : "";
      if (localStorage['basecampId'] && localStorage['userId'] && localStorage['people']) {
        scope.basecampId = localStorage['basecampId'];
        scope.userId = localStorage['userId'];
        scope.people = angular.fromJson(localStorage['people']);
        scope.people.push({"name":"Alias", "email_address":"me", "avatar_url":"/img/icon-search.png", "id":localStorage.userId});
        scope.people.push({"name":"Search by creator", "email_address":"from:", "avatar_url":"/img/icon-search.png", "id":-1});
        scope.people.push({"name":"Search by assignee", "email_address":"to:", "avatar_url":"/img/icon-search.png", "id":-1});
        scope.getAssignedTodos(); // Trigger a refresh on launch
        scope.getPeople();
      } else {
        scope.getBasecampAccount();
      }
    },
    loadTodos: function(scope) {
      chrome.storage.local.get('assignedTodos', function(data) {
        if (!_.isEmpty(data.assignedTodos)) {
          scope.assignedTodos = angular.fromJson(data['assignedTodos']);
          scope.groupByProject();
        }
      })
    }
  }
});