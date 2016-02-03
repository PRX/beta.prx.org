(function () {

  angular
    .module('prx.home')
    .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['pickList', 'pickItems', '$scope', '$filter'];

  function HomeCtrl(pickList, pickItems, $scope, $filter) {
    this.pickItems = pickItems;
    $scope.$on('$play', function (event, params) {
      if (!angular.isDefined(params.next)) {
        params.next = mkNext;
      }
    });

    function mkNext () {
      var i=-1;
      angular.forEach(pickItems, function (pick, index) {
        if (i == -1 && pick.story.id == this.story.id) {
          i = index + 1;
        }
      }, this);
      if (i != -1 && i < pickItems.length) {
        return pickItems[i].story.toSoundParams().then(function (sp) {
          sp.next = mkNext;
          return sp;
        });
      }
    }

    this.loadingMore = false;
    this.hasMore = angular.isDefined(pickList.link('next'));
    this.loadMore = function () {
      var ctrl = this;
      if (!ctrl.loadingMore) {
        ctrl.loadingMore = true;
        pickList.follow('next').then(function (nextList) {
          pickList = nextList;
          return nextList.follow('prx:items')
            .then(function (picks) {
              return $filter('groupStandalonePicks')(picks);
            })
            .then(function (groupedItems) {
              Array.prototype.push.apply(ctrl.pickItems, groupedItems);
            });
        })['finally'](function () {
          ctrl.hasMore = angular.isDefined(pickList.link('next'));
          ctrl.loadingMore = false;
        });
      }
    };
  }

}());
