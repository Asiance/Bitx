'use strict';

angular
  .module('basecampExtension.filters', [])

  /**
   * Filtering Todos by category
   * '1' - Overdue
   * '2' - Today
   * '3' - Upcoming
   * '4' - Undetermined
   */
  .filter('status', function(Utils, $filter) {
    return function(input, status) {
      if(input) {
        var currentDateYYYYMMDD = Utils.getTodayDate();
        var inputYYYYMMDD = "";
        var out = []; 
        for (var i = 0; i < input.length; i++) {
            if (input[i].due_at != null && status != '4') {
              inputYYYYMMDD = parseInt(input[i].due_at.replace(/-/g, ""));
              if ((status == '1') && (inputYYYYMMDD < currentDateYYYYMMDD)) {
                input[i].days_late =  $filter('daysLate')(input[i].due_at);
                out.push(input[i]);
              }
              else if ((status == '2') && (inputYYYYMMDD == currentDateYYYYMMDD)) out.push(input[i]);
              else if ((status == '3') && (inputYYYYMMDD > currentDateYYYYMMDD)) {
                input[i].remaining_days =  $filter('daysRemaining')(input[i].due_at);
                out.push(input[i]);
              }
            }
            else if (input[i].due_at == null && status == '4') out.push(input[i])
        }
        return out;
      } else return [];
    };
  })

  /**
   * Determine elapsed time
   */
  .filter('elapsedTime', function(Utils) {
    var today = new Date();
    return function(input) {
      if(input) {
        var diff = today - new Date(input);
        if (diff/(1000*60*60*24) < 1) // If last update is less than one day ago
          if (diff/(1000*60*60) < 1) // If last update is less than one hour ago
            return Math.round(diff/(1000*60)) + " " + chrome.i18n.getMessage("minutesAgo");
          else return Math.round(diff/(1000*60*60)) + " " + chrome.i18n.getMessage("hoursAgo");
        else return Math.round(diff/(1000*60*60*24)) + " " + chrome.i18n.getMessage("daysAgo");
      } else return "";
    };
  })

  /**
   * Determine number of days remaining 
   */
  .filter('daysRemaining', function(Utils) {
    var today = new Date();
    return function(input) {
      if(input) {
        return Math.round((new Date(input) - today)/(1000*60*60*24));
      }
    };
  })

  /**
   * Determine number of days late
   */
  .filter('daysLate', function(Utils) {
    var today = new Date();
    return function(input) {
      if(input) {
        return Math.round((today - new Date(input))/(1000*60*60*24));
      }
    };
  });