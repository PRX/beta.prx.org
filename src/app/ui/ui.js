var angular = require('angular');

// global ui and navigation
var app = angular.module('prx.ui', [
  require('./chrome/chrome'),
  require('./nav/nav'),
  require('./sheet/sheet'),
  require('./tabs/tabs')
]);
module.exports = app.name;
