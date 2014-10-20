angular.module('prx.welcome', ['ngStorage'])
.directive('prxWelcome', function () {
  return {
    restrict: 'E',
    replace: true,
    controller: 'WelcomeCtrl',
    controllerAs: 'welcome',
    templateUrl: 'welcome/welcome.html'
  };
})
.service('prxWelcome', function () {
  this.visible = false;
})
.controller('WelcomeCtrl', function (prxWelcome, $scope, $localStorage) {
  $scope.$storage = $localStorage;

  this.visible = function () {
    return !$localStorage.welcomed;
  };
});
