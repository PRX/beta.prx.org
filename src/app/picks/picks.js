angular.module('prx.picks', ['prx.stories'])
.config(function (ngHalProvider) {
  ngHalProvider.mixin('http://meta.prx.org/model/pick/*any', ['resolved', function (resolved) {
    resolved.story = resolved.follow('prx:story');
    resolved.account = resolved.follow('prx:account');
  }]);
})

.directive('prxPickList', function ($timeout, ngHal) {
  return {
    restrict: 'E',
    scope: {
      picklist: '='
    },
    templateUrl: 'picks/picks.html',
    replace: true,
    link: function (scope) {
      $timeout(function () {
        if (!angular.isDefined(scope.loading)) {
          scope.loading = true;
        }
      }, 500);
      if (angular.isDefined(scope.picklist)) {
        scope.picklist.follow('prx:picks').follow('prx:items').then(function (picks) {
          scope.loading = false;
          scope.filteredPicks = scope.$eval('picks | limitTo: (limit || 5)', {picks: picks});
        });
      }
    }
  };
})
.directive('prxPick', function ($timeout) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/embedded_pick.html',
    scope: {pick: '='}
  };
})

;

