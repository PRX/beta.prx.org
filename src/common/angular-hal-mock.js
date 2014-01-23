angular.module('angular-hal-mock', ['angular-hal', 'ngMock', 'ng'])
.config(function ($provide, ngHalProvider) {
  ngHalProvider.setRootUrl('/');

  $provide.decorator('ngHal', function ($delegate) {
    $delegate.mock = function mock () {
      var args   = Array.prototype.slice.call(arguments);
      var object;
      if (!angular.isString(args[args.length-1])) {
        object = args.pop();
      } else {
        object = {};
      }

      return ngHalProvider.generateConstructor(args)(object);
    };

    return $delegate;
  });
});