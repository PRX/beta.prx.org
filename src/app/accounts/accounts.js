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
  }).state('account.show.details', {
    url: '/details',
    views: {
      'modal@': {
        templateUrl: "accounts/detail_modal.html",
        controller: "AccountDetailsCtrl as account"
      }
    }
  });

  ngHalProvider.mixin('http://meta.prx.org/model/account/:type/*splat', ['type', 'resolved', '$sce',
    function (type, resolved, $sce) {
      resolved.imageUrl = resolved.follow('prx:image').get('enclosureUrl');
      resolved.address = resolved.follow('prx:address');
    }
  ]).mixin('http://meta.prx.org/model/address', {
    toString: function () {
      return this.city + ', ' + this.state;
    }
  });
})
.directive('limitToHtml', function ($timeout) {
  function removeEmptyTrailers (element) {
    var children = element.contents(), lastChild;
    if (children.length) {
      lastChild = children.eq(children.length - 1);
      if (lastChild.text().length) {
        removeEmptyTrailers(lastChild);
      } else {
        lastChild.remove();
        removeEmptyTrailers(element);
      }
    }
  }

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var altering = false;
      function notAltering () { altering = false; }
      scope.$watch(element.html, function () {
        if (!altering) {
          altering = true;
          if (element.text().length > attrs.limitToHtml) {
              var lettersToRemove = element.text().length - attrs.limitToHtml, lastNode;
              while (lettersToRemove > 0) {
                lastNode = element;
                while (lastNode.text().length > lettersToRemove) {
                  if (lastNode.length == 1 && lastNode[0].nodeType == 3) {
                    break;
                  } else {
                    lastNode = lastNode.contents();
                    lastNode = lastNode.eq(lastNode.length - 1);
                  }
                }
                var txt = lastNode.text();
                if (lastNode[0].nodeType == 3 && (txt.length - 15) > lettersToRemove) {
                  lastNode.text(txt.substr(0, txt.length - lettersToRemove));
                  lettersToRemove = 0;
                } else {
                  lettersToRemove -= txt.length;
                  lastNode.remove();
                }
              }
              removeEmptyTrailers(element);
              scope[attrs.htmlLimited] = true;
            } else {
              scope[attrs.htmlLimited] = false;
            }
            $timeout(notAltering);
          }
      });
    }
  };
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
})
.controller('AccountDetailsCtrl', function (account) {
  this.current = account;
});
