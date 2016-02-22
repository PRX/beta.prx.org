module.exports = function errorsConfig($urlRouterProvider) {
  'ngInject';

  $urlRouterProvider.otherwise(function ($injector, $location) {
    $injector.get('prxError').routerError($location.url());
  });
};
