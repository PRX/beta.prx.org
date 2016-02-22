module.exports = function homeRun($rootScope, $state) {
  'ngInject';

  /* istanbul ignore next */
  if (!FEAT.HOME_PAGE) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if (toState.name == 'home') {
        event.preventDefault();
        $state.go('home.comingSoon');
      }
    });
  }
};
