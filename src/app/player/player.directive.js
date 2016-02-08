module.exports = function playerDirective($controller, prxSoundFactory) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'player/player.directive.html',
    controller: 'PlayerCtrl as player',
    link: function (scope, elem, attrs, ctrl) {
      scope.$watch(attrs.sound, angular.bind(ctrl, ctrl.setSound));
    }
  };
};
