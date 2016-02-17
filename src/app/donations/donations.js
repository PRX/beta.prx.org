var angular = require('angular');

// donations module
var app = angular.module('prx.donations', [
  require('../../common/bus'),
  require('angulartics')
]);
module.exports = app.name;

// configure
app.directive('prxDonate',  ['prxDonateURL', '$analytics', '$window', '$timeout', 'Bus', require('./donations.directive')]);
app.run(                    ['Bus', '$analytics', require('./donations.run')]);
app.service('prxDonateURL', [require('./donations.service')]);
