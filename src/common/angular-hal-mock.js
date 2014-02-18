angular.module('angular-hal-mock', ['angular-hal', 'ngMock', 'ng'])
.config(function ($provide, ngHalProvider) {
  ngHalProvider.setRootUrl('/');

  if (typeof window.jasmine !== 'undefined') {
    beforeEach(function () {
      window.resolutionOf = function (stateName, name, params) {
        var result = {_isResolution : true};
        result.toString = function () {
          return "the resolution '" + this.name + "' of the state '" +stateName+ "'";
        }
        inject(function ($state) {
          result.state = $state.get(stateName);
          result.invokable = result.state.resolve[name];
          result.name = name;
          result.params = params;
        });
        return result;
      };

      function ff (fl) {
        return "'" + fl[0] + "'" + (fl[1] ? " with params: " + JSON.stringify(fl[1]) : '') + ".";
      }

      function expectedFollow (of, df) {
        return function () {
          return "Expected " + this.actual + " to follow " + ff(of) + (df ? "\n\tFollowed " + ff(df) : "");
        };
      }

      this.addMatchers({
        toFollow: function (trail) {
          if (typeof this.actual !== 'object' || !this.actual._isResolution) {
            this.message = function () { return "Expected " + this.actual + " to be a state resolution."; }
            return false;
          }

          if (!angular.isArray(trail)) {
            trail = [[trail, arguments[1]]];
          }

          var resolution = this.actual, halMock = {stack: []}, result;
          halMock.follow = jasmine.createSpy('follow').andCallFake(function (rel, params) {
            halMock.stack.push([rel, params]);
            return halMock;
          });

          inject(function ($injector) {
            result = $injector.invoke(resolution.invokable,
              null, {$stateParams: resolution.params, ngHal: halMock});
          });

          if (result !== halMock) {
            this.message = function () {
              return "Expected " + this.actual + " to resolve to an ngHal object.";
            }
            return false;
          }

          var stackCopy = halMock.stack.slice(0), errored, ei;

          angular.forEach(trail, function (step, x) {
            if (!errored) {
              var foundAt = -1;
              angular.forEach(stackCopy, function (aStep, i) {
                if (foundAt == -1 && angular.equals(aStep, step)) {
                  foundAt = i;
                }
              });
              if (foundAt != -1) {
                stackCopy.splice(0, foundAt+1);
              } else {
                errored = true;
                ei = x;
              }
            }
          });

          if (errored) {
            this.message = expectedFollow(trail[ei], stackCopy[0]);
            return false;
          }

          return true;
        }
      });
    });
  }

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