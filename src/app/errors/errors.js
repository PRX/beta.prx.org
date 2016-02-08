var angular = require('angular');

// errors module
var app = angular.module('prx.errors', [
  require('angular-ui-router')
]);
module.exports = app.name;

// configure
app.config(                    ['$urlRouterProvider', require('./errors.config')]);
app.controller('ErrorCtrl',    ['prxError', require('./errors.controller')]);
app.directive('prxErrorModal', [require('./errors.directive')]);
app.run(                       ['$rootScope', 'prxError', '$log', require('./errors.run')]);
app.service('prxError',        ['$state', require('./errors.service')]);
