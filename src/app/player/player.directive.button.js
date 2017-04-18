module.exports = function playerDirectiveButton($controller, prxSoundFactory) {
  'ngInject';

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
};
