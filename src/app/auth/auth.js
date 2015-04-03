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
})
.run(function ($window, PrxAuth) {
  var iframe = angular.element('<iframe>');
  var $body = angular.element($window.document.body);
  var uri = [FEAT.ID_SERVER, '/authorize?client_id=', FEAT.ID_CLIENT_KEY];
  var nonce = [];
  for(var i=0; i<8; i++) {
    nonce.push(randomInt(0, 15).toString(16));
  }
  nonce = nonce.join('');
  uri.push('&nonce='+nonce);
  uri.push('&response_type=token');
  uri.push('&prompt=none');
  uri = uri.join('');

  iframe.css('display', 'none');
  iframe.attr('src', uri);
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
      PrxAuth.processToken(data.access_token, nonce);
    } else {
      PrxAuth.setLoggedOut();
    }
    iframe.remove();
  });
  $body.append(iframe);

  function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
  }
}).service('PrxAuth', function ($http) {
  var PrxAuth = this;
  this.loggedIn = 'loading';
  this.processToken = function (token) {
    this.token = token;
    this.loggedIn = true;
    $http.get(FEAT.ID_SERVER + '/userinfo', {headers: {'Authorization': 'Bearer ' + token}}).then(function (result) {
      PrxAuth.currentUser = result.data.preferred_username;
    }, function () {
      this.token = undefined;
      this.loggedIn = false;
    });
  };
  this.setLoggedOut = function () {
    this.loggedIn = false;
  };
}).directive('prxAuthBadge', function () {
  return {
    restrict: 'E',
    controller: 'PrxAuthBadgeCtrl',
    controllerAs: 'auth',
    templateUrl: 'auth/badge.html'
  };
}).controller('PrxAuthBadgeCtrl', function (PrxAuth) {
  this.status = PrxAuth;
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
        PrxAuth.processToken(data.access_token, nonce);
      } else {
        PrxAuth.setLoggedOut();
      }
    });

    function randomInt(low, high) {
      return Math.floor(Math.random() * (high - low + 1) + low);
    }
  };
});
