var app = require('angular').module('prx.ui.tabs', [
  require('angular-ui-router')
]);
module.exports = app.name;

app.service('PrxSheet', function ($rootScope, $timeout) {
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
})
.directive('xiSheetDismiss', function (PrxSheet) {
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
})
.directive('xiSheet', function (PrxSheet, $animate) {
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
})
.directive('xiSheetTitle', function (PrxSheet) {
  return {
    restrict: 'E',
    template: '<h3>{{sheet.title}}</h3>',
    replace: true,
    link: function (scope) {
      scope.sheet = PrxSheet;
    }
  };
});
