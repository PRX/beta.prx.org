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
  })
  .state('terms.privacyPolicy', {
    url: '/privacy-policy',
    title: 'Privacy Policy',
    views: {
      '@': {
        templateUrl: 'terms/privacy_policy.html'
      }
    }
  })
  .state('terms.uploadingPolicy', {
    url: '/uploading-policy',
    title: 'Uploading Policy',
    views: {
      '@': {
        templateUrl: 'terms/uploading_policy.html'
      }
    }
  })
  .state('terms.downloadingPolicy', {
    url: '/downloading-policy',
    title: 'Downloading Policy',
    views: {
      '@': {
        templateUrl: 'terms/downloading_policy.html'
      }
    }
  });
});
