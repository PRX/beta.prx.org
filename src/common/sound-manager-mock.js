angular.module('soundManagerMock', ['ngPlayerHater'])
.factory('globalSoundManager', function () {
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
