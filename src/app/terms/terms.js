angular.module('prx.terms', ['ui.router'])
.config(function ($stateProvider) {
  $stateProvider.state('terms', {
    url: '/terms',
    title: 'Terms of Use',
    views: {
      '@': {
        templateUrl: 'terms/terms.html'
      }
    }
  });
});
