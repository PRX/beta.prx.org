angular.module('prx.tour', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tour', {
      url: '/prx-tour',
      title: 'What Is PRX',
      views: {
        '@': {
          templateUrl: 'tour/tour.html'
        }
      }
    })
    .state('tour.producers', {
      url: '/producers',
      title: 'PRX For Producers',
      views: {
        '@': {
          templateUrl: 'tour/producers.html'
        }
      }
    })
    .state('tour.purchasers', {
      url: '/purchasers',
      title: 'PRX For Purchasers',
      views: {
        '@': {
          templateUrl: 'tour/purchasers.html'
        }
      }
    });
})
;
