var angular = require('angular');

// home page
var app = angular.module('prx.home', [
  require('angular-ui-router'),
  require('./story_time/story_time'),
  require('../picks/picks')
]);
module.exports = app.name;

// configure
app.config(                ['$stateProvider', '$urlRouterProvider', require('./home.config')]);
app.controller('HomeCtrl', ['picks', '$scope', require('./home.controller')]);
app.run(                   ['$rootScope', '$state', require('./home.run')]);
