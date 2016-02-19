(function () {

  angular
    .module('prx.home')
    .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['pickList', 'picks', '$scope', '$filter'];

  function HomeCtrl(pickList, picks, $scope, $filter) {
    var ctrl = this;

    ctrl.picks = picks;
    $scope.$on('$play', function (event, params) {
      if (!angular.isDefined(params.next)) {
        params.next = mkNext;
      }
    });

    function mkNext () {
      var i=-1;
      angular.forEach(picks, function (pick, index) {
        if (i == -1 && pick.story.id == this.story.id) {
          i = index + 1;
        }
      }, this);
      if (i != -1 && i < picks.length) {
        return picks[i].story.toSoundParams().then(function (sp) {
          sp.next = mkNext;
          return sp;
        });
      }
    }

    ctrl.hasMore = false;
    function setHasMore() {
      ctrl.hasMore = pickList &&
        angular.isFunction(pickList.link) &&
        angular.isDefined(pickList.link('next'));
    }
    setHasMore();

    ctrl.loadingMore = false;
    ctrl.loadMore = function () {
      if (ctrl.loadingMore) {
        return false; // debounce
      }
      else {
        ctrl.loadingMore = true;
        pickList.follow('next').then(function (nextList) {
          pickList = nextList;
          return nextList.follow('prx:items')
            .then(function (picks) {
              return $filter('groupStandalonePicks')(picks);
            })
            .then(function (groupedItems) {
              Array.prototype.push.apply(ctrl.picks, groupedItems);
            });
        })['finally'](function () {
          setHasMore();
          ctrl.loadingMore = false;
        });
      }
    };
  }

}());
