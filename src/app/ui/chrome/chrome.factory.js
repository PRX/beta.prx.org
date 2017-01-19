(function () {

  angular
    .module('prx.ui.chrome')
    .factory('prxChrome', prxChrome);

  prxChrome.$inject = ['$rootScope'];

  function prxChrome($rootScope) {
    var chrome = {
      visible: true
    };

    $rootScope.$on('$stateChangeStart', function (event, state, _, fromState) {
      if (fromState.name === "" && state.data && state.data.chromeless) {
        chrome.visible = false;
      }
    });

    $rootScope.$on('$stateChangeSuccess', function (event, state) {
      chrome.visible = !(state.data || {}).chromeless;
    });

    return chrome;
  }

}());
