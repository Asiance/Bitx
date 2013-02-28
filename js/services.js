'use strict';

angular
.module('basecampExtension.services', ['ngResource'])

.factory('Authorization', function($resource) {
  return $resource('https://launchpad.37signals.com/authorization.json', {}, {
    query: {
      method: 	'GET', 
      isArray: 	false,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

.factory('User', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/people/me.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	false,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

.factory('Projects', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	true,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})	

.factory('Project', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects/:projectId.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	false,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

.factory('Todolists', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects/:projectId/todolists.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	true,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

.factory('Todolist', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects/:projectId/todolists/:todolistId.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	false,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

.factory('CompletedTodolists', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects/:projectId/todolists/completed.json', {}, {
    query: {
      method: 	'GET',
      isArray: 	true,
      headers: 	{'Authorization':'Bearer ' + localStorage['basecampToken']}}
  });
})

.factory('AssignedTodolists', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/people/:userId/assigned_todos.json', {}, {
    query: {
      method:   'GET', 
      isArray:  true,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
  }
});
})

.factory('Todo', function($resource) {
  return $resource('https://basecamp.com/:basecampId/api/v1/projects/:projectId/todos/:todoId.json', {}, {
    query: {
      method:   'GET', 
      isArray:  true,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
    },
    update: {
      method:   'PUT', 
      params:   {completed:true},
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
    }
  });
})


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