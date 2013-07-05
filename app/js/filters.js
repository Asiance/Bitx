'use strict';

angular
  .module('basecampExtension.filters', [])

  /**
   * Filtering Todos by category
   */
  .filter('status', function($filter, Utils) {
    return function(input, status) {
      var out;
      switch (status) {
        case 'overdues':
          out = _.filter(input, function(todo) {
            if (todo.due_at !== null)
              return (Utils.dateToYMD(new Date(todo.due_at)) < Utils.dateToYMD(new Date()));
          });
          _.each(out, function(todo) {
            todo.days_late = $filter('daysLate')(todo.due_at);
          });
          return out;
        case 'today':
          return _.where(input, {due_at: Utils.dateToYMD(new Date())});
        case 'upcoming':
          out =  _.filter(input, function(todo) {
            return (Utils.dateToYMD(new Date(todo.due_at)) > Utils.dateToYMD(new Date()));
          });
          _.each(out, function(todo) {
            todo.remaining_days = $filter('daysRemaining')(todo.due_at);
          });
          return out;
        case 'noduedate':
          return _.where(input, {due_at: null});
      }
    };
  })

  /**
   * Look for the translated string
   */
  .filter('i18n', function() {
    var lang = localStorage.language;
    return function(input) {
      if(window[lang] && window[lang][input]) return window[lang][input];
      else return window.en[input];
    };
  })

  /**
   * Determine elapsed time
   */
  .filter('elapsedTime', function() {
    var today = new Date();
    var lang = localStorage.language;
    if (!window[lang]) {
      lang = "en";
    }
    return function(input) {
      if(input) {
        var diff = today - new Date(input);
        if (diff/(1000*60*60*24) < 1) // If last update is less than one day ago
          if (diff/(1000*60*60) < 1) // If last update is less than one hour ago
            return Math.round(diff/(1000*60)) + " " + window[lang].minutesAgo;
          else return Math.round(diff/(1000*60*60)) + " " + window[lang].hoursAgo;
        else return Math.round(diff/(1000*60*60*24)) + " " + window[lang].daysAgo;
      } else return "";
    };
  })

  /**
   * Determine number of days remaining
   */
  .filter('daysRemaining', function() {
    var today = new Date();
    return function(input) {
      return Math.round((new Date(input) - today)/(1000*60*60*24));
    };
  })

  /**
   * Determine number of days late
   */
  .filter('daysLate', function() {
    var today = new Date();
    return function(input) {
      return Math.round((today - new Date(input))/(1000*60*60*24));
    };
  })

  /**
   * Print tooltip if filter 'createdby:' is on
   */
  .filter('filterOn', function() {
    var lang = localStorage.language;
    return function(input, isFilter) {
      if (isFilter) return window[lang].assignedTo.replace(/\{x\}/g, input);
      else return null;
    };
  })

  /**
   * Remove domain name of email address
   * (Just for display)
   */
  .filter('removeDomain', function() {
    return function(input) {
      return input.split("@")[0];
    };
  })

  /**
   * Advanced search that look through todos
   */
  .filter('keywordSearch', function($filter) {
    var people = angular.fromJson(localStorage.people);
    return function(input, search) {
      if(search && input) {
        var out = input;
        var user;
        var fromUser = search.match(/\bfrom:([\s]*[\w]*)\b/g);                  // Look for the keyword
        if (fromUser) fromUser = fromUser[0].split(":")[1].replace(/\s/g,"");   // Extract the parameter, remove space if any

        var toUser = search.match(/\bto:([\s]*[\w]*)\b/g);
        if (toUser) toUser = toUser[0].split(":")[1].replace(/\s/g,"");

        // If the keyword 'from:' has been typed
        if (fromUser !== null) {
          // Bind 'me' with the logged user identity
          if (fromUser === 'me') {
            user = {'id': parseInt(localStorage.userId, 10)};
          } else {
            //Look for the user among employees of the company
            user = _.find(people, function(user) {
              return ( $filter('removeDomain')(user.email_address) === fromUser );
            });
          }
          // If 'someone' has been found, look for his todos'
          if (user) {
            out = _.filter(out, function(item) {
              return ( item.assignee && item.creator.id === user.id );
            });
          } else return [];
        }

        // If 'to:' has been type
        if (toUser !== null) {
          // Bind 'me' with the logged user identity
          if (toUser === 'me') {
            user = {'id': parseInt(localStorage.userId, 10)};

          } else {
            //Look for the user among employees of the company
            user = _.find(people, function(user) {
              return ($filter('removeDomain')(user.email_address) === toUser);
            });
          }
          // If 'someone has been found, look for his todos'
          if (user) {
            out = _.filter(out, function(item) {
              return ( item.assignee && item.assignee.id === user.id );
            });
          } else return [];
        }

        if ( new RegExp("from:|to:", "gi").test(search) )  {
          // If something follows 'from:someone or to:someone'
          // Look in the todo description or in the project name or in the todolist title
          var realSearch = search.replace(/(from:|to:)\w+\s*/gi, "");
          if (realSearch.length > 0) {
            out = _.filter(out, function(item) {
              return ( item.content.match(new RegExp(realSearch, "gi")) || item.project.match(new RegExp(realSearch, "gi")) || item.todolist.match(new RegExp(realSearch, "gi")) );
            });
          }
          return out;
        }

        // If no keyword has been typed, load the regular search filter
        out = _.filter(input, function(item) {
          return ( item.assignee && item.assignee.id == localStorage.userId );
        });
        return $filter('filter')(out, search);

      // If search input is empty, show your own todos
      } else {
        return _.filter(input, function(item) {
          return ( item.assignee && item.assignee.id == localStorage.userId );
        });
      }
    };
  })

  /**
   * Advanced search that look through people of Basecamp account
   */
  .filter('suggestionSearch', function($filter) {
    var out = [];
    return function(input, search) {
      if(search && input) {
        var realSearch = search.match(/[^ |^:]*$/)[0];

        // User suggestions
        // Check if you are typing a name (after 'from:' or 'to:')
        if (new RegExp(/\b:([\s]*[\w]*)$\b/g).test(search) || new RegExp(/:$/).test(search)) {
          out = _.filter(input, function(item) {
            return ( item.id != -1 && (item.name.match(new RegExp("^" + realSearch, "gi")) || item.email_address.match(new RegExp("^" + realSearch, "gi"))) );
          });
          if (_.isEmpty(out)) {
            out = _.filter(input, function(item) {
              return ( item.id != -1 && (item.name.match(new RegExp(realSearch, "gi")) || item.email_address.match(new RegExp(realSearch, "gi"))) );
            });
          }
          if (realSearch === $filter('removeDomain')(out[0].email_address)) {
            return [];
          }
        }

        // Keyword suggestions
        // If you are not typing a name, suggest keyword
        else {
          out = _.filter(input, function(item) {
            return (item.id == -1 && item.email_address.match(new RegExp("^" + realSearch), "gi"));
          });
        }
        return out;
      }
    };
  });