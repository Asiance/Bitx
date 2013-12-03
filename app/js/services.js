'use strict';

angular
  .module('basecampExtension.services', ['ngResource'])
  .factory('Utils', function () {
    return {
      dateToYMD: function (date) {
        var d = date.getDate(),
            m = date.getMonth() + 1,
            y = date.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
      }
    };
  });