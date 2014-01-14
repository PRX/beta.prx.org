angular.module('prx', ['ngAnimate', 'prxNavigation', 'ngTouch', 'placeholders', 'ui.router', 'prx.home', 'prx.stories', 'templates-jade_app'])
// .run(function ($rootScope) {
//   if (navigator.userAgent.match(/iPhone|iPad/)) {
//     $rootScope.klasses = ['iOS'];
//   } else if (navigator.userAgent.match(/Android/)) {
//     $rootScope.klasses = ['iOS'];
//   }
// })
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
    template: '<a class="drawer fa fa-bars " ng-click="openDrawer()"></a>',
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
    template: '<div class="drawer" ng-click="closeDrawer()"><a >Search</a></div>'
  };
});
