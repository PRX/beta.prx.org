(function () {

  angular
    .module('prx.player')
    .directive('prxGlobalPlayer', prxGlobalPlayer);

  // prxGlobalPlayer.$inject = [];

  function prxGlobalPlayer() {
    return {
      restrict: 'E',
      replace: true,
      controller: 'GlobalPlayerCtrl',
      controllerAs: 'player',
      templateUrl: 'player/global_player.html'
    };
  }

}());
