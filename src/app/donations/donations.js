var angular = require('angular');

// donations module
var app = angular.module('prx.donations', [
  require('../../common/bus'),
  require('angulartics')
]);
module.exports = app.name;

// configure
app.directive('prxDonate', require('./donations.directive'));
app.service('prxDonateURL', require('./donations.service'));
app.run(require('./donations.run'));
