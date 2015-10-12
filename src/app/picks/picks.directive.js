(function () {

  angular
    .module('prx.picks')
    .directive('prxPick', prxPick);

  prxPick.$inject = [];

  function prxPick() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'picks/pick.html',
      scope: {picki: '=pick'},
      controller: 'PickCtrl as pick',
    };
  }

}());
