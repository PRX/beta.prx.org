var angular = require('angular');
var uuid = require('node-uuid');

// simple service to get uuids using node-uuid project
var app = angular.module('angular-uuid', []);
module.exports = app.name;

app.factory('$uuid', function ($window) {
  return uuid;
});
