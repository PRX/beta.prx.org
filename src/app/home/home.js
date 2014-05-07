angular.module('prx.home', ['ui.router', 'prx.home.storytime', 'prx.pick_list'])
.config(function ($stateProvider, $urlRouterProvider) {

  /* istanbul ignore else */
  if (!FEAT.HOME_PAGE) {
    $urlRouterProvider.when('/', '/nxt');
  }

  $stateProvider.state('home', {
    url: ('/'),
    title: 'Home',
    views: {
      '@': {
        controller: 'HomeCtrl as home',
        templateUrl: 'home/home.html'
      }
    },
    resolve: {
      picklist: ['ngHal', function (ngHal) {
        return ngHal.followOne('prx:pick-list', {id: FEAT.home_pick_list_id}).then(function(picklist) {
          picklist.title = "PRX Picks";
          return picklist;
        });
      }]
    }
  }).state('home.comingSoon', {
    url: 'nxt',
    title: "Coming Soon",
    views: {
      'modal@': {
        templateUrl: 'home/construction_modal.html'
      }
    }
  });
}).run(function ($rootScope, $state) {

  /* istanbul ignore else */
  if (!FEAT.HOME_PAGE) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if (toState.name == 'home') {
        event.preventDefault();
        $state.go('home.comingSoon');
      }
    });
  }
})

.controller('HomeCtrl', function (picklist) {
  this.picklist = picklist;
})
;
