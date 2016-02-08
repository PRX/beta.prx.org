module.exports = function errorsConfig($urlRouterProvider) {
  $urlRouterProvider.otherwise(function ($injector, $location) {
    $injector.get('prxError').routerError($location.url());
  });
};
