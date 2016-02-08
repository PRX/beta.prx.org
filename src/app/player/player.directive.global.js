module.exports = function playerDirectiveGlobal() {
  return {
    restrict: 'E',
    replace: true,
    controller: 'GlobalPlayerCtrl',
    controllerAs: 'player',
    templateUrl: 'player/global_player.html'
  };
};
