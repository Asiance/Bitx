"use strict";

describe('toggleContent', function() {
  var element, scope, ctrl;
  beforeEach(module('basecampExtension.services'));
  beforeEach(module('basecampExtension.servicesCache'));
  beforeEach(module('basecampExtension.controllers'));
  beforeEach(module('basecampExtension.filters'));
  beforeEach(module('basecampExtension.directives'));
  beforeEach(module('ui.highlight'));
  beforeEach(module('ui.keypress'));
  beforeEach(inject(function($rootScope, $controller, $compile) {
    element = angular.element('<toggle-content category="{{category}}" todos-counter="{{todosCounter}}"></toggle-content>');
    scope = $rootScope;
    $compile(element)(scope);
    scope.$digest();
  }));

  it("should compile template", function() {
    expect(element.find("h1").length).toBe(1);
  });
});
