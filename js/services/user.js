'use strict';

basecampExtension.factory('user', function($rootScope, localStorage) {

  var LOCAL_STORAGE_ID = 'fmUser',
      userString = localStorage[LOCAL_STORAGE_ID];

  var user = userString ? JSON.parse(userString) : {
    email: undefined,
    password: undefined
  };

  $rootScope.$watch(function() { return user; }, function() {
    localStorage[LOCAL_STORAGE_ID] = JSON.stringify(user);
  }, true);

  return user;
});