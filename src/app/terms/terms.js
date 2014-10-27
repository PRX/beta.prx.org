angular.module('prx.terms', ['ui.router'])
.config(function ($stateProvider) {
  $stateProvider.state('terms', {
    url: '/terms-of-use',
    title: 'Terms of Use',
    views: {
      '@': {
        templateUrl: 'terms/terms.html'
      }
    }
  })
  .state('terms.userAgreement', {
    url: '/user-agreement',
    title: 'User Agreement',
    views: {
      '@': {
        templateUrl: 'terms/user_agreement.html'
      }
    }
  });
});
