angular.module('prx.home', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
  if (!FEAT.HOME_PAGE) {
    $urlRouterProvider.when('/', '/nxt');
  }

  $stateProvider.state('home', {
    url: ''
  }).state('home.comingSoon', {
    url: '/nxt',
    views: {
      'modal@': {
        templateUrl: 'home/construction_modal.html'
      }
    }
  });
});
