angular.module('prx.pick_list', ['prx.stories'])

.directive('prxPickList', function ($timeout, ngHal) {
  return {
    restrict: 'E',
    scope: {
      picklist: '='
    },
    templateUrl: 'picks/pick_list.html',
    replace: true,
    link: function (scope) {
      $timeout(function () {
        if (!angular.isDefined(scope.loading)) {
          scope.loading = true;
        }
      }, 500);
      scope.picklist.follow('prx:picks').follow('prx:items').then(function (picks) {
        scope.loading = false;
        scope.filteredPicks = scope.$eval('picks | limitTo: (limit || 5)', {picks: picks});
      });
    }
  };
})
.directive('prxPick', function ($timeout) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/embedded_pick.html',
    scope: {pick: '='},
    link: function (scope) {
      scope.pick.follow('prx:story').then(function(story) {
        scope.story = story;
      });
      scope.pick.follow('prx:account').then(function(account) {
        scope.account = account;
      });
    }
  };
})
.directive('prxCurator', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/curator.html',
    scope: {account: '='}
  };
})
;

