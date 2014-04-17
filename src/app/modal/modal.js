angular.module('prx.modal', ['prx.errors', 'ui.router'])
.run(function ($rootScope, prxModal) {
  var modalKey = 'modal@';
  var DISMISS_LINK = "<a class='dismiss' dismiss-modal></a>";

  $rootScope.$on('$stateChangeStart', function (_, state, params, from) {
    if (state.views && state.views[modalKey] &&
          !state.views[modalKey].instrumented) {
      var view = state.views[modalKey];
      view.instrumented = true;
      state.data = state.data || {}; state.data.modal = true;
      if (angular.isDefined(view.template)) {
        view.template = DISMISS_LINK + view.template;
      } else if (view.templateUrl) {
        var templateUrl = view.templateUrl;
        delete view.templateUrl;
        view.templateProvider = ['$stateParams',
          '$http', '$templateCache',
          function ($stateParams, $http, $templateCache) {
            var url = templateUrl;
            if (angular.isFunction(url)) {
              url = templateUrl($stateParams);
            }
            return $http.get(url, {cache: $templateCache}).then(function (response) {
              return  DISMISS_LINK + response.data;
            });
          }
        ];
      }
    }
    if (from.abstract) {
      prxModal.visible = !!(state.data || {}).modal;
    }
  });
  $rootScope.$on('$stateChangeSuccess', function (event, state) {
    prxModal.visible = !!(state.data || {}).modal;
  });
})
.directive('dismissModal', function ($state) {
  return {
    restrict: 'A',
    replace: true,
    template: "<a ng-show='dismissable' ui-sref='^'></a>",
    link: function (scope) {
      if ($state.href('^')) {
        scope.dismissable = true;
      }
    }
  };
})
.directive('prxModal', function () {
  return {
    restrict: 'E',
    replace: true,
    controller: 'ModalCtrl',
    controllerAs: 'modal',
    templateUrl: 'modal/modal.html'
  };
})
.service('prxModal', function () {
  this.visible = false;
})
.controller('ModalCtrl', function (prxError, prxModal) {
  this.visible = function () {
    return prxError.hasError() || prxModal.visible;
  };
  this.error = prxError.hasError;
});
