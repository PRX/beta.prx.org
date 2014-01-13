angular.module('prxNavigation', ['ui.router'])
.directive('prxLoadingBar', function ($state, $stateParams, $injector, $q, $timeout) {
  function instrument(route, scope) {
    if (!route._loadingInstrumented) {
      var numResolutions = 2;
      route.resolve = route.resolve || {};
      angular.forEach(route.resolve, function (resolve, name) {
        numResolutions += 1;
        if (angular.isString(resolve)) {
          route.resolve[name] = function () {
            return $q.when($injector.get(resolve)).then(function (v) {
              scope.finishedResolutions += 1;
              return v;
            });
          };
        } else {
          route.resolve[name] = $injector.annotate(resolve);
          if (angular.isArray(resolve)) {
            resolve = resolve[resolve.length-1];
          }
          route.resolve[name].push(function () {
            return $q.when(resolve.apply(this, arguments)).then(function (v) {
              scope.finishedResolutions += 1;
              return v;
            });
          });
        }
      });

      route.resolve.minimumDelay = ['$timeout', '$q', function ($timeout, $q) {
        var deferred = $q.defer();
        $timeout(function () { deferred.resolve(true); }, 50);
        return deferred.promise.then(function () { scope.finishedResolutions += 1; });
      }];

      route._loadingResolutions = numResolutions;
      route._loadingInstrumented = true;
    }
  }

  return {
    restrict: 'E',
    scope: true,
    replace: true,
    template: '<div class="loading-bar" ng-class="{hide: finishedPercent() == 100, reset: reset}"><div ng-style="barStyle()"></div></div>',
    link: function (scope) {
      scope.totalResolutions = 3;
      scope.finishedResolutions = 1;
      
      scope.finishedPercent = function () {
        return parseInt(scope.finishedResolutions * 100 / scope.totalResolutions, 10);
      };
      
      scope.barStyle = function () {
        return { width: scope.finishedPercent() + '%' };
      };

      scope.$on('$stateChangeStart', function (event, route) {
        instrument(route, scope);
        scope.reset = true;
        scope.finishedResolutions = 0;
        scope.totalResolutions = route._loadingResolutions;
        $timeout(function () {
          scope.finishedResolutions += 1;
          scope.reset = false;
        }, 1);
      });

      scope.$on('$stateChangeSuccess', function () {
        scope.finishedResolutions = scope.totalResolutions;
      });
    }
  };
});
