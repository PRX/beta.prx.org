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
.directive('prxPick', function ($timeout, ngHal) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/pick.html',
    scope: {
      pick: '='
    },
    link: function (scope) {
      $timeout(function () {
        if (!angular.isDefined(scope.loading)) {
          scope.loading = true;
        }
      }, 500);
      if (angular.isDefined(scope.pick)) {
        scope.loading = false;
      }
    }
  };
})
.directive('prxSuggestedPick', function($timeout, ngHal) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/pick.html',
    scope: {
      story: '='
    },
    link: function (scope) {
      $timeout(function () {
        if (!angular.isDefined(scope.loading)) {
          scope.loading = true;
        }
      }, 500);
      ngHal.follow('prx:pick-list', {id: FEAT.home_pick_list_id}).follow('prx:picks').follow('prx:items').then(function (picks) {
        if (angular.isDefined(scope.story)) {
          var storyIndex = -1;
          angular.forEach(picks, function(pick, idx) {
            if (pick.story.id == scope.story.id) { storyIndex = idx; }
          });
          if (storyIndex > -1) {
            console.log("removing story at index " + storyIndex);
            picks.splice(storyIndex, 1);
          }
        }
        if (picks.length > 0) {
          scope.loading = false;
          var index = Math.floor(Math.random() * picks.length);
          scope.pick = picks[index];
        }
      });
    }
  };
})

;

