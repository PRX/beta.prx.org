(function () {

  angular
    .module('prx.ui.sheet')
    .directive('xiSheet', xiSheet);

  xiSheet.$inject = ['PrxSheet', '$animate'];

  function xiSheet(PrxSheet, $animate) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        scope.sheet = PrxSheet;
        scope.$watch('sheet.show', function (show) {
          if (show) {
            $animate.addClass(elem, 'visible');
          } else {
            $animate.removeClass(elem, 'visible');
          }
        });
        scope.$watch('sheet.expand', function (show) {
          if (show) {
            $animate.addClass(elem, 'expanded');
          } else {
            $animate.removeClass(elem, 'expanded');
          }
        });
      }
    };
  }

}());
