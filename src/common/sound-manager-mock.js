var angular = require('angular');

// imitate sound manager
var app = angular.module('soundManagerMock', [
  require('./angular-player-hater')
]);
module.exports = app.name;

app.factory('globalSoundManager', function () {
  var mock = {configuration: {onready: angular.noop}};
  var methods = "createSound canPlayLink canPlayMIME "+
  "canPlayURL mute pauseAll resumeAll stopAll unmute";
  angular.forEach(methods.split(' '), function (method) {
    mock[method] = angular.noop;
  });

  mock.setup = function (config) {
    this.configuration = config;
    if (angular.isFunction(this.configuration.onready)) {
      this.configuration.onready();
    }
  };

  return mock;
});
