module.exports = function homeRun($rootScope, $state) {
  'ngInject';

  /* istanbul ignore next */
  if (!FEAT.SHOW_HOMEPAGE) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if (toState.name == 'home') {
        event.preventDefault();
        $state.go('home.comingSoon');
      }
    });
  }
};
