var angular = require('angular');

/**
 * www.prx.org entry point
 */
var app = angular.module('prx', [
  require('angular-animate'),
  require('angular-sanitize'),
  require('./ui/ui'),
  require('../common/prx-navigation'),
  require('angular-touch'),
  require('angular-ui-router'),
  require('./ui/ui'),
  require('./ui/nav/nav'),
  require('ng-sortable'),
  require('./home/home'),
  require('./stories/stories'),
  require('./accounts/accounts'),
  require('./series/series'),
  'templates', // TODO: this one's slightly different
  require('./player/player'),
  require('./donations/donations'),
  require('../common/angular-flag'),
  require('../common/prx-experiments'),
  require('angulartics'),
  require('angulartics-google-analytics'),
  require('../common/angulartics-prx-count'),
  require('./app'),
  require('./errors/errors'),
  require('./modal/modal'),
  require('./ui/chrome/chrome'),
  require('../common/prx-model-config'),
  require('./dsp/dsp'),
  require('../common/mobile'),
  require('./breadcrumbs-service'),
  require('./ads/ads'),
  require('./auth/auth')
]);


//
// TODO: refactor everything after this comment
//
app.config(function (ngFlagProvider,
  $analyticsProvider, $stateProvider, prxperimentProvider, PRXDrawerProvider) {
  $analyticsProvider.firstPageview(false);
  $analyticsProvider.virtualPageviews(false);
  prxperimentProvider.base('https://x.prx.org')
  .clientId(['$q', '$window', function ($q, $window) {
    /* istanbul ignore if */
    if (angular.isDefined($window.ga)) {
      var deferred = $q.defer();
      $window.ga(function (tracker) { deferred.resolve(tracker.get('clientId')); });
      return deferred.promise;
    } else {
      return 'tests';
    }
  }]);
  /* istanbul ignore next */
  if (!(FEAT.APPLICATION_VERSION != 'development' && FEAT.APPLICATION_VERSION != 'integration' && !window.callPhantom)) {
    prxperimentProvider.enabled(false);
  }
  ngFlagProvider.flags(FEAT);

  PRXDrawerProvider.register({
    name: 'Search',
    weight: PRXDrawerProvider.TOP,
    href: 'http://www.prx.org/search/all',
    type: 'search'
  }, {
    name: 'Browse',
    href: 'http://www.prx.org/pieces',
    type: 'category',
    children: [
      {
        name: "Diary",
        href: "http://www.prx.org/format/Diary",
        type: "item"
      },
      {
        name: "Documentary",
        href: "http://www.prx.org/format/Documentary",
        type: "item"
      },
      {
        name: "Essay",
        href: "http://www.prx.org/format/Essay",
        type: "item"
      },
      {
        name: "Fiction",
        href: "http://www.prx.org/format/Fiction",
        type: "item"
      },
      {
        name: "News Reporting",
        href: "http://www.prx.org/format/News%20Reporting",
        type: "item"
      },
      {
        name: "Special",
        href: "http://www.prx.org/format/Special",
        type: "item"
      },
    ]
  });
}).run(function ($rootScope, $location, $analytics, $timeout) {
  $rootScope.$on('$stateChangeSuccess', function () {
    var url = $analytics.settings.pageTracking.basePath + $location.url();
    $timeout(function () {  $analytics.pageTrack(url); }, 2);
  });
});
angular.module('prx.base',['prx'])
.config(/* istanbul ignore next */
  function ($locationProvider, ngHalProvider) {
    ngHalProvider.setRootUrl(FEAT.apiServer);
    $locationProvider.html5Mode(true);
}).run(/* istanbul ignore next */
  function (PrxAuth, $rootScope) {
    PrxAuth.$checkLoggedIn();
    PrxAuth.currentUser().then(function (user) {
      $rootScope.currentUser = user;
    });
});
