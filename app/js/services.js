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
 * Return date following YYYYMMDD format
 */
.factory('Utils', function () {
  return {
    getTodayDate: function () {
      var currentDate = new Date();
      var yyyy = currentDate.getFullYear().toString();
      var mm = (currentDate.getMonth()+1).toString();
      var dd = currentDate.getDate().toString();
      var dateFormat = parseInt(yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]));
      return dateFormat;
    }
  }
});