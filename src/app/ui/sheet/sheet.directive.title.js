(function () {

  angular
    .module('prx.ui.sheet')
    .directive('xiSheetTitle', xiSheetTitle);

  xiSheetTitle.$inject = ['PrxSheet'];

  function xiSheetTitle(PrxSheet) {
    return {
      restrict: 'E',
      template: '<h3>{{sheet.title}}</h3>',
      replace: true,
      link: function (scope) {
        scope.sheet = PrxSheet;
      }
    };
  }

}());
