angular.module('prx.aboutus', ['ui.router'])
.config(function ($stateProvider) {
  $stateProvider.state('aboutUs', {
    abstract: true,
    title: 'About Us'
  })
  .state('aboutUs.press', {
    url: '/about-us/press',
    title: 'Press',
    views: {
      '@': {
        templateUrl: 'about_us/press.html'
      }
    }
  });
});
