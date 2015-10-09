(function () {

  angular
    .module('prx.home')
    .config(config);

  config.$inject = ['$stateProvider', '$urlRouterProvider'];

  function config($stateProvider, $urlRouterProvider) {
    /* istanbul ignore next */
    if (!FEAT.HOME_PAGE) {
      $urlRouterProvider.when('/', '/nxt');
    }

    $stateProvider.state('home', {
      url: '/',
      title: "Home",
      views: {
        '@': {
          controller: 'HomeCtrl as home',
          templateUrl: 'home/home.html'
        }
      },
      resolve: {
        picks: function (ngHal, $filter) {
          return ngHal.follow('prx:picks').follow('prx:items').then(function (picks) {
            return $filter('groupStandalonePicks')(picks);
          });
        }
      }
    }).state('home.comingSoon', {
      url: 'nxt',
      title: "Coming Soon",
      views: {
        'modal@': {
          templateUrl: 'home/construction_modal.html'
        }
      }
    }).state('demo', {
      url: '/demo',
      title: "Demo",
      views: {
        '@': {
          controller: 'HomeCtrl as home',
          templateUrl: 'home/demo.html'
        }
      },
      resolve: {
        picks: function (ngHal, $filter) {
          return ngHal.follow('prx:picks').follow('prx:items').then(function (picks) {
            return $filter('groupStandalonePicks')(picks);
          });
        }
      }
    });
  }

}());
