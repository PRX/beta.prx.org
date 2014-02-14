angular.module('prx.auth', ['ng'])
.service('Auth', function ($timeout, $q, $injector) {
  var deferred;

  function authenticate(token) {
    if (deferred) {
      deferred.resolve(token);
    }
    this.authenticationRequired = false;
  }

  function failAuthenticate() {

  }

  this.authenticationRequired = false;

  this.requestLogin = function () {
    this.authenticationRequired = true;
    deferred = $q.defer();
    return deferred.promise;
  };

  this.login = function (username, password) {
    $timeout(function () {
      if (false) {
        authenticate(1234);
      } else {
        failAuthenticate();
      }
    }, 400);
  };

  this.cancel = function () {
    if (deferred) {
      deferred.fail();
    }
  };
});