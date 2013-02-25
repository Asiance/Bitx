'use strict';

angular
	.module('basecampExtension.services', ['ngResource'])
	.factory('Projects', function($resource) {
		return $resource('https://launchpad.37signals.com/authorization.json', {}, {
    	query: {method:'GET', isArray:false}
    });
	})
	.factory('User', function($resource) {
		return $resource('https://basecamp.com/:basecampId/api/v1/people/me.json', {}, {
    	query: {method:'GET', isArray:false}
    });
	})
	.factory('AssignedTodolists', function($resource) {
		return $resource('https://basecamp.com/:basecampId/api/v1/people/:userId/assigned_todos.json', {}, {
    	query: {method:'GET', isArray:true}
    });
	});