angular.module('prx', ['ngAnimate', 'prxNavigation', 'ngTouch', 'ui.router', 'prx.home', 'prx.stories', 'templates', 'prx.player', 'ngFlag'])
.config(function ($locationProvider, $urlRouterProvider, ngFlagProvider) {
  $urlRouterProvider.when('/', '/stories/123');
  $locationProvider.html5Mode(true);
  ngFlagProvider.flags(FEAT.JSON);
})
.controller('appCtrl', function ($scope, playerHater) {
  $scope.player = playerHater;
  $scope.activeStory = {};
})
.directive('prxActionButtons', function ($window) {
  return {
    restrict: 'E',
    link: function (scope, el, attrs) {
      scope.items = [
        {text: 'next', href: 'story({storyId: activeStory.id+1})'},
        {text: 'asd2', href: 'asd'},
        {text: 'asd3', href: 'asd'},
        {text: 'asd4', href: 'asd'},
        {text: 'asd5', href: 'asd'},
        {text: 'asd6', href: 'asd'},
        {text: 'asd7', href: 'asd'}
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
