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

  this.usedPicks = [];
  this.getSuggestedPicks = function () {
    if (!this.suggestedPicks) {
      this.suggestedPicks = ngHal.follow('prx:pick-list', {id: FEAT.home_pick_list_id}).follow('prx:picks').follow('prx:items');
    }
    return this.suggestedPicks;
  };

  this.excludeStory = function(exclude) {
    var self = this;
    return this.getSuggestedPicks().then(function(suggestedPicks) {
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

  this.recordPick = function(suggested) {
    var index = -1;
    var self = this;
    self.getSuggestedPicks().then(function(suggestedPicks) {
      angular.forEach(suggestedPicks, function(pick, idx) {
        if (pick.id == suggested.id) { index = idx; }
      });
      suggestedPicks.splice(index, 1);
      self.usedPicks.push(suggested);
      if (suggestedPicks.length === 0) {
        suggestedPicks = self.usedPicks;
        self.usedPicks = [];
      }
      self.suggestedPicks = $q.when(suggestedPicks);
    });
  };

  this.suggestedPick = function(exclude) {
    var self = this;
    return self.excludeStory(exclude).then(function(picks) {
      if (picks.length === 0) {
        return null;
      }
      var suggested = picks[Math.floor(Math.random() * picks.length)];
      self.recordPick(suggested);
      return suggested;
    });
  };

})
;

