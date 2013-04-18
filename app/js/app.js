'use strict';

angular
  .module('basecampExtension',
    ['basecampExtension.directives',
    'basecampExtension.controllers',
    'basecampExtension.services',
    'basecampExtension.filters'])

  .config([
    '$routeProvider', '$locationProvider', '$httpProvider', '$resourceProvider', function($routeProvider) {
      $routeProvider
        .when('/', {
          controller: 'TodosController',
          templateUrl: 'views/todos.html'
        })
        .otherwise({redirectTo: '/'});
    }
  ]);

// How do you use it? We want to lear how to improve it.
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-17785768-10']);
_gaq.push(['_trackPageview', '/open']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();