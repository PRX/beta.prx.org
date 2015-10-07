(function () {

  angular
    .module('prx.errors')
    .config(config);

  config.$inject = ['$urlRouterProvider'];

  function config($urlRouterProvider) {
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('prxError').routerError($location.url());
    });
  }

}());
