(function () {

  angular
    .module('prx.ui.sheet')
    .directive('xiSheetDismiss', xiSheetDismiss);

  xiSheetDismiss.$inject = ['PrxSheet'];

  function xiSheetDismiss(PrxSheet) {
    return {
      restrict: 'A',
      link: function (scope, elem) {
        elem.on('click', function () {
          scope.$apply(function () {
            PrxSheet.expand = !PrxSheet.expand;
          });
        });
      }
    };
  }

}());
