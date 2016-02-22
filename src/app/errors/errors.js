var angular = require('angular');

// errors module
var app = angular.module('prx.errors', [
  require('angular-ui-router')
]);
module.exports = app.name;

// configure
app.config(require('./errors.config'));
app.controller('ErrorCtrl', require('./errors.controller'));
app.directive('prxErrorModal', require('./errors.directive'));
app.service('prxError', require('./errors.service'));
app.run(require('./errors.run'));
