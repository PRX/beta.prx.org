angular.module('prx.aboutus', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('aboutUs', {
    abstract: true,
    title: 'About Us'
  })
  .state('aboutUs.whatIsPrx', {
    url: '/about-us/what-is-prx',
    views: {
      '@': {
        templateUrl: 'about_us/what_is_prx.html'
      }
    },
    title: 'What Is PRX'
  });
});
