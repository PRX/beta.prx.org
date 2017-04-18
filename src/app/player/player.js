var angular = require('angular');

// audio player module
var app = angular.module('prx.player', [
  require('../../common/angular-player-hater'),
  require('angulartics'),
  require('../../common/bus')
]);
module.exports = app.name;

// configure
app.controller('GlobalPlayerCtrl', require('./player.controller.global'));
app.controller('PlayerCtrl',       require('./player.controller'));
app.directive('prxPlayerButton',   require('./player.directive.button'));
app.directive('prxGlobalPlayer',   require('./player.directive.global'));
app.directive('prxPlayer',         require('./player.directive'));
app.directive('prxPlayerScrubber', require('./player.directive.scrubber'));
app.directive('waveform',          require('./player.directive.waveform'));
app.factory('prxSoundFactory',     require('./player.factory'));
app.filter('timeCode',             require('./player.filters'));
app.service('prxPlayer',           require('./player.service'));
app.run(require('./player.run'));
