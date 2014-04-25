angular.module('prx.home', ['ui.router', 'prx.home.storytime'])
.config(function ($stateProvider, $urlRouterProvider) {

  /* istanbul ignore else */
  if (!FEAT.HOME_PAGE) {
    $urlRouterProvider.when('/', '/nxt');
  }

  $stateProvider.state('home', {
  }).state('home.comingSoon', {
    url: '/nxt',
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
});
