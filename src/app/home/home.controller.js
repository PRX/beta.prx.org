(function () {

  angular
    .module('prx.home')
    .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['picks', '$scope'];

  function HomeCtrl(picks, $scope) {
    this.picks = picks;
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
  }

}());
