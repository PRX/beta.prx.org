(function () {

  angular
    .module('prx.home')
    .run(run);

  run.$inject = ['$rootScope', '$state'];

  function run($rootScope, $state) {
    /* istanbul ignore next */
    if (!FEAT.HOME_PAGE) {
      $rootScope.$on('$stateChangeStart', function (event, toState) {
        if (toState.name == 'home') {
          event.preventDefault();
          $state.go('home.comingSoon');
        }
      });
    }
  }

}());
