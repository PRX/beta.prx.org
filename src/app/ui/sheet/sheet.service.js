(function () {

  angular
    .module('prx.ui.sheet')
    .service('PrxSheet', PrxSheetService);

  PrxSheetService.$inject = ['$rootScope', '$timeout'];

  function PrxSheetService($rootScope, $timeout) {
    var PrxSheet = this;
    this.show = false;
    this.expand = false;
    $rootScope.$on("$stateChangeStart", function (event, toState) {
      PrxSheet.expand = false;
      if (!toState.views || !toState.views["sheet@"]) {
        PrxSheet.show = false;
      }
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      if (toState.views && toState.views["sheet@"]) {
        PrxSheet.show = true;
        if (toState.data && toState.data.openSheet) {
          PrxSheet.expand = true;
        }
      }
    });
  }

}());
