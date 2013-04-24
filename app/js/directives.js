'use strict';


angular.module('basecampExtension.directives', [])
  .directive('nicescroll', function($document, $location, $parse) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var params = scope.$eval(attrs.nicescroll);
        $(element).niceScroll({
          cursorcolor: '#a7a7a7',
          cursoropacitymax: 0.8,
          mousescrollstep : params.scrollstep,
          cursorborder: '0px',
          cursorwidth: '8px',
        });
      }
    };
  })

  .directive('unselectable', function($document, $location, $parse) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        $(element).on('selectstart', false);
      }
    }
  });