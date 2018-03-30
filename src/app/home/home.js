angular.module('prx.home', ['ui.router', 'prx.picks'])
.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider.state('home', {
    url: '/',
    title: "Home",
    views: {
      '@': {
        controller: 'HomeCtrl as home',
        templateUrl: 'home/home.html'
      }
    },
    resolve: {
      picks: function (ngHal, $filter) {
        return ngHal.follow('prx:picks').follow('prx:items').then(function (picks) {
          return $filter('groupStandalonePicks')(picks);
        });
      }
    }
  });
})
.controller('HomeCtrl', function (picks, $scope) {
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
})
;
