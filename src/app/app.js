angular.module('prx', ['ngAnimate', 'prxNavigation', 'ngTouch', 'ui.router', 'prx.home', 'prx.stories', 'prx.series', 'templates', 'prx.player', 'ngFlag', 'angulartics', 'angulartics.google.analytics', 'angulartics.prx.count'])
.config(function ($locationProvider, $urlRouterProvider, ngFlagProvider, $analyticsProvider) {
  $analyticsProvider.firstPageview(false);
  $urlRouterProvider.when('/', '/stories/123');
  $locationProvider.html5Mode(true);
  ngFlagProvider.flags(FEAT.JSON);
})
.controller('appCtrl', function ($scope, playerHater) {
  $scope.player = playerHater;
  $scope.activeStory = {};
})
.filter('timeAgo', function () {
  return function (time) {
    if (!(time instanceof Date)) {
      time = Date.parse(time);
    }
    var diff = new Date() - time;
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
    } else if (days < 35) {
      return "about a month ago";
    } else if (days < 365) {
      return Math.round(months) + " months ago";
    } else if (years < 2) {
      if (months >= 1.5) {
        return "a year and " + Math.round(months) + " months ago";
      } else {
        return "about a year ago";
      }
    } else if (months >= 1.5) {
        return Math.round(years) + " years and " + Math.round(months) + " months ago";
    } else {
      return Math.round(years) + " years ago";
    }
  };
})
.directive('prxImg', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: { src: '=' },
    template: "<div class='img' ng-style='{\"background-image\":\"url(\"+src+\")\"}'/>"
  };
})
.directive('prxActionButtons', function ($window) {
  return {
    restrict: 'E',
    link: function (scope, el, attrs) {
      scope.items = [
        {text: 'Full Site', href: 'story({storyId: activeStory.id+1})'}
      ];
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
