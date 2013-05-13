'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
  var element, scope, ctrl;
  beforeEach(module('basecampExtension.services'));
  beforeEach(module('basecampExtension.servicesCache'));
  beforeEach(module('basecampExtension.controllers'));
  beforeEach(module('basecampExtension.filters'));
  beforeEach(module('basecampExtension.directives'));
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    ctrl = $controller('TodosController', {
      $scope: scope
    });
  }));

  it("empty", function() {
  });
});
