angular.module('prx.auth', ['prx.ui.nav'])
.config(function (PRXDrawerProvider) {
  PRXDrawerProvider.register({
    name: 'Sign In',
    weight: PRXDrawerProvider.BOTTOM,
    href: 'http://www.prx.org/sessions/new',
    nav: true,
    template: '<prx-auth-badge></prx-auth-badge>',
    dropdownTemplate: '<prx-auth-window></prx-auth-window>'
  });
}).service('PrxAuth', function (ngHal, $q, $window) {
  var PrxAuth = this,
      deferred = $q.defer(),
      currentUser = {loggedIn: false};
  this.$$loginPromise = deferred.promise;

  this.$checkLoggedIn = function () {
    var iframe = angular.element('<iframe>'),
        $body = angular.element($window.document.body),
        uri = [FEAT.ID_SERVER + '/authorize?client_id=' + FEAT.ID_CLIENT_KEY],
        nonce = [];
    for (var i=0; i<8; i++) {
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
        PrxAuth.$processToken(accessToken).then(function (user) {
          deferred.resolve(user);
        });
      } else {
        deferred.reject('not logged in');
      }
      iframe.off('load', onLoad);
      iframe.remove();
      iframe = undefined;
    });

    $body.append(iframe);
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
}).directive('prxAuthBadge', function () {
  return {
    restrict: 'E',
    controller: 'PrxAuthBadgeCtrl',
    controllerAs: 'auth',
    templateUrl: 'auth/badge.html'
  };
}).controller('PrxAuthBadgeCtrl', function (PrxAuth) {
  var ctrl = this;
  PrxAuth.currentUser().then(function (user) {
    if (user.loggedIn) {
      user.account.follow('prx:series').follow('prx:items').then(function (items) {
        user.series = items;
      });
    }
    ctrl.currentUser = user;
  });
}).directive('prxAuthWindow', function () {
  return {
    restrict: 'E',
    templateUrl: 'auth/window.html',
    controller: 'PrxAuthBadgeCtrl',
    controllerAs: 'auth'
  };
}).directive('prxAuthLoginFrame', function (PrxAuth) {
  return function (scope, elem, attrs) {
    var uri = [FEAT.ID_SERVER, '/authorize?client_id=', FEAT.ID_CLIENT_KEY];
    var nonce = [];
    for(var i=0; i<8; i++) {
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
        PrxAuth.$processToken(data.access_token, nonce);
      }
    });

    function randomInt(low, high) {
      return Math.floor(Math.random() * (high - low + 1) + low);
    }
  };
});
