angular.module('prx.accounts', ['ui.router', 'angular-hal'])
.config(function ($stateProvider, ngHalProvider, urlTranslateProvider) {
  $stateProvider.state('account', {
    abstract: true,
    resolve: {}
  }).state('account.show', {
    url: '/accounts/:accountId',
    views: {
      '@': {
        templateUrl: "accounts/account.html",
        controller: 'AccountCtrl as account'
      }
    },
    resolve: {
      account: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.follow('prx:account', {id: $stateParams.accountId});
      }],
      recentStories: ['account', function (account) {
        return account.follow('prx:stories').follow('prx:items');
      }]
    }
  });

  ngHalProvider.mixin('http://meta.prx.org/model/account/:type/*splat', ['type', 'resolved', '$sce',
    function (type, resolved, $sce) {
      resolved.imageUrl = resolved.follow('prx:image').get('enclosureUrl');
      resolved.address = resolved.follow('prx:address');
      return function (document) {
        document.description = $sce.trustAsHtml(document.description);
      };
    }
  ]);
})
.directive('prxAccount', function () {
  return {
    restrict: 'E',
    scope: {account: '='},
    templateUrl: 'accounts/embedded_account.html',
    replace: true
  };
})
.controller('AccountCtrl', function (account, recentStories) {
  this.current = account;
  this.recentStories = recentStories;
});
