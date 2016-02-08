var angular = require('angular');

// audio player module
var app = angular.module('prx.player', [
  require('../../common/angular-player-hater'),
  require('angulartics'),
  require('../../common/bus')
]);
module.exports = app.name;

// configure
app.controller('GlobalPlayerCtrl', ['prxPlayer', require('./player.controller.global')]);
app.controller('PlayerCtrl',       ['prxPlayer', require('./player.controller')]);
app.directive('prxPlayerButton',   ['$controller', 'prxSoundFactory', require('./player.directive.button')]);
app.directive('prxGlobalPlayer',   [require('./player.directive.global')]);
app.directive('prxPlayer',         ['$controller', 'prxSoundFactory', require('./player.directive')]);
app.directive('prxPlayerScrubber', [require('./player.directive.scrubber')]);
app.directive('waveform',          ['$window', '$timeout', require('./player.directive.waveform')]);
app.factory('prxSoundFactory',     ['smSound', 'prxPlayer', '$q', require('./player.factory')]);
app.filter('timeCode',             [require('./player.filters')]);
app.run(                           ['Bus', '$analytics', require('./player.run')]);
app.service('prxPlayer',           ['Bus', require('./player.service')]);
