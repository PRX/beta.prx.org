(function () {

  angular
    .module('prx.ui.tabs')
    .directive('xiTabName', xiTabName);

  // xiTabName.$inject = [];

  function xiTabName() {
    return {
      restrict: 'E',
      require: '^^xiTab',
      transclude: true,
      scope: false,
      link: function (scope, elem, attrs, ctrl, transclude) {
        ctrl.setName(transclude);
      }
    };
  }

}());
