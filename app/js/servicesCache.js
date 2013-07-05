angular
.module('basecampExtension.servicesCache', ['ngResource'])
.factory('Cache', function () {
  // Load data from cache
  return {
    loadParams: function(scope) {
      scope.search = localStorage.lastSearch ? localStorage.lastSearch : "";
      if (localStorage.basecampId && localStorage.userId && localStorage.people) {
        scope.basecampId = localStorage.basecampId;
        scope.userId = localStorage.userId;
        scope.people = angular.fromJson(localStorage.people);
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
          scope.assignedTodos = angular.fromJson(data.assignedTodos);
          scope.groupByProject();
          scope.$apply();
        }
      });
    }
  };
});