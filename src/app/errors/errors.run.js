module.exports = function errorsRun($rootScope, prxError, $log) {
  'ngInject';

  $rootScope.$on('$stateChangeError', function (event, toState, stateParams, fromState, fromParams, error) {
    $log.error(arguments);
    prxError.stateChangeError(toState, stateParams, fromState, fromParams, error);
  });
  $rootScope.$on('$stateChangeStart', prxError.dismiss);
};
