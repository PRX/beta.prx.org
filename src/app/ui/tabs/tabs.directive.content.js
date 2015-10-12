(function () {

  angular
    .module('prx.ui.tabs')
    .directive('xiTabContent', xiTabContent);

  // xiTabContent.$inject = [];

  function xiTabContent() {
    return {
      restrict: 'E',
      require: '^^xiTab',
      transclude: true,
      scope: false,
      link: function (scope, elem, attrs, ctrl, transclude) {
        ctrl.setContent(transclude);
      }
    };
  }

}());
