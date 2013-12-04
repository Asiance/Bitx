'use strict';

angular
  .module('basecampExtension',
    ['basecampExtension.directives',
    'basecampExtension.filters',
    'basecampExtension.services',
    'basecampExtension.servicesCache',
    'ui.highlight',
    'ui.keypress',
    'basecampExtension.controllers'])

  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/', {
          controller: 'TodosController',
          templateUrl: 'views/todos.html'
        })
        .otherwise({redirectTo: '/'});
    }
  ]);

// How do you use it? We want to learn how to improve it.
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-17785768-10']);
_gaq.push(['_trackPageview', '/open']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();