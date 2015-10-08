(function () {

  angular
    .module('prx.player')
    .directive('prxPlayerButton', prxPlayerButton);

  prxPlayerButton.$inject = ['$controller', 'prxSoundFactory'];

  function prxPlayerButton($controller, prxSoundFactory) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      require: '^?prxPlayer',
      templateUrl: 'player/button.html',
      link: function (scope, elem, attrs, ctrl) {
        if (!ctrl) {
          ctrl = $controller('PlayerCtrl', {$scope: scope});
          scope.$parent.$watch(attrs.sound, angular.bind(ctrl, ctrl.setSound));
        }
        scope.player = ctrl;
      }
    };
  }

}());
