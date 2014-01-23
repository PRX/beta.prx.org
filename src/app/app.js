angular.module('prx', ['ngAnimate', 'prxNavigation', 'ngTouch', 'placeholders', 'ui.router', 'prx.home', 'prx.stories', 'templates-jade_app', 'prx.player'])
.run(function ($rootScope, playerHater, $animate) {
  $rootScope.player = playerHater;
  $rootScope.animate = $animate;
})
.directive('prxActionButtons', function ($window) {
  return {
    restrict: 'E',
    link: function (scope, el, attrs) {
      scope.items = [
        {text: 'asd1', href: 'asd'},
        {text: 'asd2', href: 'asd'},
        {text: 'asd3', href: 'asd'},
        {text: 'asd4', href: 'asd'},
        {text: 'asd5', href: 'asd'},
        {text: 'asd6', href: 'asd'},
        {text: 'asd7', href: 'asd'}
      ];
    },
    template: "<nav><a ng-repeat='item in items' ng-href='{{item.href}}'>{{item.text}}</a></nav>"
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
