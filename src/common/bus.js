angular.module('prx.bus', [])
.service('Bus', function () {
  this.listeners = {};

  this.on = function (eventName, callback) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(callback);
    return this;
  };

  this.off = function (eventName, callback) {
    var index = (this.listeners[eventName] || []).indexOf(callback);
    if (index !== -1) {
      this.listeners[eventName].splice(index, 1);
    }
    return this;
  };

  this.emit = function (eventName) {
    var args = [].slice.call(arguments, 1);
    angular.forEach(this.listeners[eventName]||[], function (listener) {
      listener.apply(args[0], args);
    });
    return this;
  };
});
