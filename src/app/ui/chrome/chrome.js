var angular = require('angular');

// ui+chrome module
var app = angular.module('prx.ui.chrome', [
  require('angular-ui-router')
]);
module.exports = app.name;

// configure
app.factory('prxChrome', ['$rootScope', require('./chrome.factory')]);
