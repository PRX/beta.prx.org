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
.directive('prxPick', function ($timeout, $q) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/pick.html',
    scope: {
      pick: '='
    },
    link: function (scope) {
      scope.loading = true;
      $q.when(scope.pick).then(function(pick) {
        scope.loading = false;
        scope.pick = pick;
      });
    }
  };
})
.service('prxPicks', function(ngHal, $q) {

  var self = this;
  var getSuggestedPicks = function () {
    if (self.suggestedPicks) {
      return $q.when(self.suggestedPicks);
    }
    return ngHal.follow('prx:pick-list', {id: FEAT.home_pick_list_id}).follow('prx:picks').follow('prx:items').then(function (items) {
      self.suggestedPicks = items;
      self.usedPicks = [];
      return self.suggestedPicks;
    });
  };

  var excludeStory = function(exclude) {
    return getSuggestedPicks().then(function(suggestedPicks) {
      if (angular.isDefined(exclude)) {
        var result = [];
        result.length = 0;
        angular.forEach(suggestedPicks, function (elem) {
          if (elem.story.id != exclude.id) {
            result.push(elem);
          }
        });
        return result;
      }
      return suggestedPicks;
    });
  };

  var recordPick = function(suggested) {
    var index = -1;
    angular.forEach(self.suggestedPicks, function(pick, idx) {
      if (pick.id == suggested.id) { index = idx; }
    });
    self.suggestedPicks.splice(index, 1);
    self.usedPicks.push(suggested);
    if (self.suggestedPicks.length === 0) {
      self.suggestedPicks = self.usedPicks;
      self.usedPicks = [];
    }
  };

  this.suggestedPick = function(exclude) {
    return excludeStory(exclude).then(function(picks) {
      if (picks.length === 0) {
        return null;
      }
      var suggested = picks[Math.floor(Math.random() * picks.length)];
      recordPick(suggested);
      return suggested;
    });
  };

})
;

