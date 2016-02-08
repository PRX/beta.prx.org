var angular = require('angular');

// prx auth service
var app = angular.module('prx.auth', [
  require('../ui/nav/nav')
]);
module.exports = app.name;

app.config(function (PRXDrawerProvider) {
  PRXDrawerProvider.register({
    name: 'Sign In',
    weight: PRXDrawerProvider.BOTTOM,
    href: 'http://www.prx.org/sessions/new',
    nav: true,
    template: '<prx-auth-badge></prx-auth-badge>',
    dropdownTemplate: '<prx-auth-window></prx-auth-window>'
  });
})
.service('PrxAuth', function (ngHal, $q, $window) {
  var PrxAuth = this,
      deferred = $q.defer(),
      currentUser = {loggedIn: false};
  this.$$loginPromise = deferred.promise;

  /* istanbul ignore next */
  this.$checkLoggedIn = function () {
    var iframe = angular.element('<iframe>'),
        $body = angular.element($window.document.body),
        uri = [FEAT.ID_SERVER + '/authorize?client_id=' + FEAT.ID_CLIENT_KEY],
        nonce = [];

    for (var i = 0; i < 8; i++) {
      nonce.push(randomInt(0, 15).toString(16));
    }

    nonce = nonce.join('');
    uri.push("&nonce=", nonce, "&response_type=token&prompt=none");
    iframe.css('display', 'none');
    iframe.attr('src', uri.join(''));

    iframe.on('load', function onLoad() {
      var query = false, accessToken;

      try {
        query = iframe[0].contentDocument.location.hash.replace(/^#/,'');
      } catch (e) {}

      if (query && (accessToken = parseQuery(query).access_token)) {
        PrxAuth.$processToken(accessToken);
      } else {
        deferred.reject('not logged in');
      }

      iframe.off('load', onLoad);
      iframe.remove();
      iframe = undefined;
    });

    $body.append(iframe);
  };

  this.$resetPromise = function () {
    deferred = $q.defer();
    this.$$loginPromise = deferred.promise;
  };

  this.$processToken = function (token) {
    this.token = token;
    this.loggedIn = true;

    return ngHal.follow('prx:authorization', {}, headers(token)).then(function (result) {
      angular.copy({
        loggedIn: true,
        login: result.name,
        accountUrl: result.link('prx:default-account').url(),
        token: token
      }, currentUser);

      return result.follow('prx:default-account');
    }, function (result) {
      console.error(result);
      return $q.reject(result);
    }).then(function (account) {
      currentUser.account = account;
      return account.follow('prx:image');
    }).then(function (image) {
      currentUser.imageUrl = image.link('enclosure').url();
      return currentUser;
    }).then(function (user) {
      deferred.resolve(user);
      return user;
    });
  };

  this.currentUser = function (required) {
    if (required) {
      return this.$$loginPromise;
    } else {
      return this.$$loginPromise['catch'](function (rejection) {
        return currentUser;
      });
    }
  };

  function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
  }

  function parseQuery(string) {
    var data = {};
    angular.forEach(string.split('&'), function (pair) {
      pair = pair.split('=');
      data[pair[0]] = pair[1];
    });
    return data;
  }

  function headers(token) {
    return {
      headers: { 'Authorization': 'Bearer ' + token }
    };
  }
})
.controller('PrxAuthBadgeCtrl', function (PrxAuth) {
  // noop
})
.directive('prxAuthBadge', function () {
  // This is a widget that appears in the top nav, which will display
  // `prxAuthWindow` when activated.
  return {
    restrict: 'E',
    controller: 'PrxAuthBadgeCtrl',
    controllerAs: 'auth',
    templateUrl: 'auth/badge.html'
  };
})
.directive('prxAuthWindow', function () {
  // This is a dropdown that contains a login form, or details about the
  // currently logged in user.
  return {
    restrict: 'E',
    templateUrl: 'auth/window.html',
    controller: 'PrxAuthBadgeCtrl',
    controllerAs: 'auth'
  };
})
.directive('prxAuthSeriesList', function () {
  return {
    restrict: 'E',
    templateUrl: 'auth/series.html',
    controller: function (PrxAuth) {
      var ctrl = this;
      PrxAuth.currentUser(true).then(function (user) {
        return user.account.follow('prx:series').follow('prx:items');
      }).then(function (items) {
        ctrl.series = items;
      });
    },
    controllerAs: 'authSeriesList'
  };
})
.directive('prxAuthLoginFrame', function (PrxAuth) {
  /* istanbul ignore next */
  return function (scope, elem, attrs) {
    var uri = [FEAT.ID_SERVER, '/authorize?client_id=', FEAT.ID_CLIENT_KEY];
    var nonce = [];

    for(var i = 0; i < 8; i++) {
      nonce.push(randomInt(0, 15).toString(16));
    }

    nonce = nonce.join('');

    uri.push('&nonce='+nonce);
    uri.push('&response_type=token');
    uri.push('&prompt=login');
    uri = uri.join('');
    elem.attr('src', uri);
    var iframe = elem;
    iframe.on('load', function () {
      var data = {};

      try {
        var pairs = iframe[0].contentDocument.location.hash.replace(/^#/,'').split('&');
        angular.forEach(pairs, function (pair) {
          pair = pair.split('=');
          data[pair[0]] = pair[1];
        });
      } catch (e) { }

      if (data.access_token) {
        PrxAuth.$resetPromise();
        PrxAuth.$processToken(data.access_token, nonce);
      }
    });

    function randomInt(low, high) {
      return Math.floor(Math.random() * (high - low + 1) + low);
    }
  };
});
