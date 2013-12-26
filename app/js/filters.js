'use strict';

angular
  .module('basecampExtension.filters', [])

  /**
   * Filtering Todos by category
   * Dates are ISO 8601, so they can be easily sorted chronologically as string
   * See: http://en.wikipedia.org/wiki/Lexicographical_order
   */
   .filter('status', function($filter) {

    function dateToYMD(date) {
      var d = date.getDate(),
      m = date.getMonth() + 1,
      y = date.getFullYear();
      return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }

    var today = dateToYMD(new Date());
    return function(input, status) {
      switch (status) {
        case 'overdues':
          return _.filter(input, function(todo) {
            return todo.due_at ? todo.due_at < today : false;
          });
        case 'today':
          return _.where(input, { due_at: today });
        case 'upcoming':
          return _.filter(input, function(todo) {
            return todo.due_at ? todo.due_at > today : false;
          });
        case 'noduedate':
          return _.where(input, { due_at: null });
      }
    };
  })

  /**
   * Look for the translated string
   */
  .filter('i18n', function(Language) {
    return function(input) {
      return window[Language] && window[Language][input] ? window[Language][input] : window.en[input];
    };
  })

  /**
   * Determine elapsed time
   */
  .filter('elapsedTime', function(Language) {
    var today = new Date();
    return function(input) {
      var diff = today - new Date(input);
      if (diff/(1000*60*60*24) < 1) // If last update is less than one day ago
        if (diff/(1000*60*60) < 1) // If last update is less than one hour ago
          return Math.round(diff/(1000*60)) + ' ' + (window[Language].minutesAgo ? window[Language].minutesAgo : window.en.minutesAgo);
        else return Math.round(diff/(1000*60*60)) + ' ' + (window[Language].hoursAgo ? window[Language].hoursAgo : window.en.hoursAgo);
      else return Math.round(diff/(1000*60*60*24)) + ' ' + (window[Language].daysAgo ? window[Language].daysAgo : window.en.hoursAgo);
    };
  })

  /**
   * Determine number of days late/remaining
   */
  .filter('daysDifference', function() {
    var today = new Date();
    return function(input) {
      return Math.round(Math.abs(new Date(input) - today)/(1000*60*60*24));
    };
  })

  /**
   * Print tooltip if filter 'createdby:' is on
   */
  .filter('filterOn', function(Language) {
    return function(input, isFilter) {
      if (!isFilter) return '';
      return window[Language] && window[Language].assignedTo ?
             window[Language].assignedTo.replace(/\{x\}/g, input) : window.en.assignedTo.replace(/\{x\}/g, input);
    };
  })

  /**
   * Remove domain name of email address
   * (Just for display)
   */
  .filter('removeDomain', function() {
    return function(input) {
      return input.split('@')[0];
    };
  })

  /**
   * Advanced search that look through todos
   */
  .filter('keywordSearch', function($filter) {
    return function(input, search, userIDs, people) {
      if (search) {
        var out = input;
        var user;
        var fromUser = search.match(/\bfrom:([\s]*[\w\.]*)\b/g);                  // Look for the keyword
        if (fromUser) fromUser = fromUser[0].split(':')[1].replace(/\s/g,'');   // Extract the parameter, remove space if any

        var toUser = search.match(/\bto:([\s]*[\w\.]*)\b/g);
        if (toUser) toUser = toUser[0].split(':')[1].replace(/\s/g,'');

        // If the keyword 'from:' has been typed
        if (fromUser !== null) {
          // Bind 'me' with the logged user identity
          if (fromUser === 'me') {
            user = userIDs;
          } else {
            // Look for the FIRST user () that match the name
            // NOTE: If different users have the same name and are in different Basecamp accounts,
            // you will get only one of their user account, the first that is found below
            user = _.find(people, function(user) {
              return $filter('removeDomain')(user.email_address) === fromUser;
            });
          }
          // If 'someone' has been found, look for his todos'
          if (user) {
            out = _.filter(out, function(item) {
              return item.creator && (item.creator.id === user.id || _.contains(user, item.creator.id));
            });
          } else return [];
        }

        // If 'to:' has been type
        if (toUser !== null) {
          // Bind 'me' with the logged user identity
          if (toUser === 'me') {
            user = userIDs;
          } else {
            //Look for the user among employees of the company
            user = _.find(people, function(user) {
              return ($filter('removeDomain')(user.email_address) === toUser);
            });
          }
          // If 'someone has been found, look for his todos'
          if (user) {
            out = _.filter(out, function(item) {
              return item.assignee && (item.assignee.id === user.id || _.contains(user, item.assignee.id));
            });
          } else return [];
        }

        if (new RegExp('from:|to:', 'gi').test(search)) {
          // If something follows 'from:someone or to:someone'
          // Look in the todo description or in the project name or in the todolist title
          var realSearch = search.replace(/(from:|to:)[\w\.]+\s*/gi, '');
          if (realSearch.length > 0) {
            out = _.filter(out, function(item) {
              return item.content.match(new RegExp(realSearch, 'gi')) ||
                     item.project.match(new RegExp(realSearch, 'gi')) ||
                     item.todolist.match(new RegExp(realSearch, 'gi'));
            });
          }
          return out;
        }
        // If no keyword has been typed, load the regular search filter
        out = _.filter(input, function(todo) {
          return todo.assignee && _.contains(userIDs, todo.assignee.id);
        });
        return $filter('filter')(out, search);

      // If search input is empty, show your own todos
      } else {
        return _.filter(input, function(todo) {
          return todo.assignee && _.contains(userIDs, todo.assignee.id);
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
      if (search) {
        var realSearch = search.match(/[^ |^:]*$/)[0];

        // User suggestions
        // Check if you are typing a name (after 'from:' or 'to:')
        if (new RegExp(/\b:([\s]*[\w]*)$\b/g).test(search) || new RegExp(/:$/).test(search)) {
          out = _.filter(input, function(item) {
            return item.id != -1 && (item.name.match(new RegExp('^' + realSearch, 'gi')) ||
                   item.email_address.match(new RegExp('^' + realSearch, 'gi')));
          });
          if (_.isEmpty(out)) {
            out = _.filter(input, function(item) {
              return item.id != -1 && (item.name.match(new RegExp(realSearch, 'gi')) ||
                     item.email_address.match(new RegExp(realSearch, 'gi')));
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
            return item.id == -1 && item.email_address.match(new RegExp('^' + realSearch), 'gi');
          });
        }
        return out;
      }
    };
  });
