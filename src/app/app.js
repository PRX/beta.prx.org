angular.module('prx', ['ngAnimate',
  'prxNavigation',
  'ngTouch',
  'ui.router',
  'prx.home',
  'prx.stories',
  'prx.series',
  'templates',
  'prx.player',
  'ngFlag',
  'angulartics',
  'angulartics.google.analytics',
  'angulartics.prx.count',
  'prx.appCtrl',
  'prx.title'])
.config(function ($locationProvider, $urlRouterProvider, ngFlagProvider,
  $analyticsProvider, $stateProvider) {
  $analyticsProvider.firstPageview(false);
  $urlRouterProvider.when('/', '/stories/73865');
  $stateProvider.state('not_found', {
    url: '/not_found',
    template: '<h1>404 - Not Found</h1>'
  });
  $locationProvider.html5Mode(true);
  ngFlagProvider.flags(FEAT.JSON);
});
angular.module('prx.appCtrl', ['prx.player', 'prx.url-translate'])
.controller('appCtrl', function ($scope, $location, playerHater, urlTranslate) {
  $scope.player = playerHater;
  $scope.activeStory = {};
  $scope.modal = {};
  $scope.$on('$stateChangeStart', function (event, state, params, from) {
    if (from.abstract) {
      $scope.modal.visible = !!(state.data || {}).modal;
    }
  });
  $scope.$on('$stateChangeSuccess', function (event, state) {
    $scope.modal.visible = !!(state.data || {}).modal;
    $scope.desktopUrl = "http://www.prx.org" + urlTranslate($location.path());
  });
})
.filter('timeAgo', function () {
  return function (time) {
    if (!(time instanceof Date)) {
      time = Date.parse(time);
    }
    var diff = Math.floor(new Date() - time);
    var seconds = diff / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;
    var months = (years - Math.floor(years)) * 12;
    if (seconds < 15) {
      return "just now";
    } else if (seconds < 45) {
      return seconds + " seconds ago";
    } else if (seconds < 90) {
      return "about a minute ago";
    } else if (minutes < 45) {
      return Math.round(minutes) + " minutes ago";
    } else if (minutes < 90) {
      return "about an hour ago";
    } else if (hours < 24) {
      return Math.round(hours) + " hours ago";
    } else if (hours < 40) {
      return "about a day ago";
    } else if (days < 28) {
      return Math.round(days) + " days ago";
    } else if (days < 40) {
      return "about a month ago";
    } else if (days < 365) {
      return Math.round(months) + " months ago";
    } else if (years < 2 && months < 11.5) {
      if (months >= 1.5) {
        return "a year and " + Math.round(months) + " months ago";
      } else {
        return "about a year ago";
      }
    } else if (months >= 1.5 && months < 11.5) {
        return Math.floor(years) + " years and " + Math.round(months) + " months ago";
    } else {
      return Math.round(years) + " years ago";
    }
  };
})
.directive('prxImg', function ($timeout) {
  return {
    restrict: 'E',
    replace: true,
    scope: { src: '=' },
    template: "<div class='img' ng-class='{loaded:loaded}'><img><div></div></div>",
    link: function (scope, element) {
      var imgTag = element.children().eq(0);
      var holder = element.children().eq(1);
      imgTag.on('load', function () {
        holder.css('background-image', 'url('+imgTag.attr('src')+')');
        $timeout(function () {
          scope.loaded = true;
        }, 60); // Trying to make sure that it is in the buffer.
      });
      scope.$watch('src', function (src) {
        holder.css('background-image', null);
        scope.loaded = false;
        imgTag.attr('src', src);
      });
    }
  };
})
.directive('prxActionButtons', function ($window) {
  return {
    restrict: 'E',
    link: function (scope, el, attrs) {
      scope.items = [];
    },
    template: "<nav><a ng-repeat='item in items' ui-sref='{{item.href}}'>{{item.text}}</a></nav>"
  };
})
.directive('prxDrawerButton', function ($rootScope) {
  return {
    restrict: 'E',
    template: '<a class="drawer" ng-click="openDrawer()"></a>',
    link: function (scope) {
      $rootScope.closeDrawer = function () {
        $rootScope.drawerOpen = false;
      };
      scope.openDrawer = function () {
        $rootScope.drawerOpen = true;
      };
    }
  };
})
.directive('prxDrawer', function () {
  return {
    restrict: 'E',
    templateUrl: 'drawer.html'
  };
});
