'use strict';

angular
	.module('basecampExtension.config', [])
	.config(function($httpProvider) {
  	return $httpProvider.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('basecampToken');
});