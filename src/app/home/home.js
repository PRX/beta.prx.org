var angular = require('angular');

// home page
var app = angular.module('prx.home', [
  require('angular-ui-router'),
  require('./story_time/story_time'),
  require('../picks/picks')
]);
module.exports = app.name;

// configure
app.config(require('./home.config'));
app.controller('HomeCtrl', require('./home.controller'));
app.directive('onScrollIn', require('./home.directive'));
app.run(require('./home.run'));
