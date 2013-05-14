basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  '../app/lib/jquery*.js',
  '../app/lib/angular.min.js',
  '../app/lib/angular-*.js',
  '../app/lib/angular-ui-utils.min.js',
  '../app/lib/underscore-min.js',
  'lib/angular-mocks.js',
  'lib/servicesCacheMock.js',
  '../app/js/controllers.js',
  '../app/js/directives.js',
  '../app/js/filters.js',
  '../app/js/services.js',
  '../app/js/lang/en.js',
  '*Spec.js'
];

autoWatch = true;

browsers = ['Chrome'];
