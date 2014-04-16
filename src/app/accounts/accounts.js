angular.module('prx.accounts', ['ui.router', 'prx.modelConfig', 'prx.url-translate'])
.config(function ($stateProvider, ngHalProvider) {
  $stateProvider.state('account', {
    abstract: true,
    resolve: {}
  }).state('account.show', {
    url: '/accounts/:accountId',
    title: ['account', function (account) {
      return ["Accounts", account.name];
    }],
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
      }],
      translateUrl: ['account', 'urlTranslate', function (account, urlTranslate) {
        urlTranslate.addTranslation('/accounts/'+account.id, account.oldPath());
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
      if (type == 'individual') {
        type = 'user';
      }
      return {
        oldPath: function () {
          return ['', type, this.path].join('/');
        }
      };
    }
  ]).mixin('http://meta.prx.org/model/address', {
    toString: function () {
      return this.city + ', ' + this.state;
    }
  });
})
.directive('limitToHtml', function ($timeout) {
  function findChild (element) {
    var children = element.contents();
    if (children.length) {
      return findChild(children.eq(children.length - 1));
    } else {
      return element;
    }
  }

  function removeEmptyTrailers (element) {
    var children = element.contents(), lastChild;
    if (children.length) {
      lastChild = children.eq(children.length - 1);
      if (lastChild.text().length) {
        removeEmptyTrailers(lastChild);
        if (isTextNode(lastChild)) {
          while(/\s/.test(lastChild.text()[lastChild.length-1])) {
            lastChild.text(lastChild.text().substr(0, lastChild.text().length-1));
          }
          if (lastChild.text() === '') {
            lastChild.remove();
          }
        }
      } else {
        lastChild.remove();
        removeEmptyTrailers(element);
      }
    }
  }

  function isTextNode(node) {
    return (node.nodeType || node[0] && node[0].nodeType) === 3;
  }

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var altering = false;
      function notAltering () { altering = false; }
      scope.$watch(function () { return element.html(); }, function () {
        if (!altering) {
          altering = true;
          if (element.text().length > attrs.limitToHtml) {
              var lettersToRemove = element.text().length - attrs.limitToHtml, lastNode;
              while (lettersToRemove > 0) {
                lastNode = element;
                while (lastNode.text().length > lettersToRemove) {
                  if (lastNode.length == 1 && isTextNode(lastNode)) {
                    break;
                  } else {
                    lastNode = lastNode.contents();
                    lastNode = lastNode.eq(lastNode.length - 1);
                  }
                }
                var txt = lastNode.text();
                if (isTextNode(lastNode) && (txt.length - 15) > lettersToRemove) {
                  txt = txt.substr(0, txt.length - lettersToRemove + 1);
                  if (txt[txt.length - 1] == ' ') {
                    lastNode.text(txt.substr(0, txt.length - 1));
                  } else {
                    txt = txt.split(' ');
                    lastNode.text(txt.slice(0, txt.length - 1).join(' '));
                  }
                  lettersToRemove = 0;
                } else {
                  lettersToRemove -= txt.length;
                  lastNode.remove();
                }
              }
              removeEmptyTrailers(element);
              lastNode = findChild(element);
              lastNode.text(lastNode.text() + ' ...');
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
